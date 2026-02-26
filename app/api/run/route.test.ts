import { POST } from './route';
import { NextRequest } from 'next/server';
import { exec } from 'child_process';

// Mock child_process
jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

// Mock util.promisify to return a function that calls exec
jest.mock('util', () => ({
    promisify: jest.fn((fn) => {
        return (...args: unknown[]) =>
            new Promise((resolve, reject) => {
                fn(...args, (err: Error | null, result: { stdout: string; stderr: string }) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
    }),
}));

const mockExec = exec as jest.MockedFunction<typeof exec>;

const VALID_API_KEY = 'test-api-key';

function createRequest(body: unknown, apiKey?: string): NextRequest {
    return new NextRequest('http://localhost/api/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey !== undefined ? { 'x-api-key': apiKey } : {}),
        },
        body: JSON.stringify(body),
    });
}

describe('POST /api/run', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, RUN_API_KEY: VALID_API_KEY };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Authentication', () => {
        it('should return 500 if RUN_API_KEY is not configured', async () => {
            delete process.env.RUN_API_KEY;

            const response = await POST(createRequest({ command: 'echo hi' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Run API key not configured');
        });

        it('should return 401 if x-api-key header is missing', async () => {
            const response = await POST(createRequest({ command: 'echo hi' }));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should return 401 if x-api-key header is wrong', async () => {
            const response = await POST(createRequest({ command: 'echo hi' }, 'wrong-key'));
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });
    });

    describe('Input validation', () => {
        it('should return 400 if body is not valid JSON', async () => {
            const request = new NextRequest('http://localhost/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': VALID_API_KEY,
                },
                body: 'invalid json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid JSON body');
        });

        it('should return 400 if command is missing', async () => {
            const response = await POST(createRequest({}, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('command is required');
        });

        it('should return 400 if command is empty string', async () => {
            const response = await POST(createRequest({ command: '' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('command is required');
        });

        it('should return 400 if command is whitespace only', async () => {
            const response = await POST(createRequest({ command: '   ' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('command is required');
        });

        it('should return 400 if command is not a string', async () => {
            const response = await POST(createRequest({ command: 123 }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('command is required');
        });
    });

    describe('Successful execution', () => {
        it('should return stdout and stderr on success', async () => {
            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: null, result: { stdout: string; stderr: string }) => void;
                cb(null, { stdout: 'hello world\n', stderr: '' });
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'echo hello world' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.stdout).toBe('hello world\n');
            expect(data.stderr).toBe('');
            expect(data.exitCode).toBe(0);
            expect(typeof data.duration).toBe('number');
        });

        it('should return stderr output on success', async () => {
            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: null, result: { stdout: string; stderr: string }) => void;
                cb(null, { stdout: '', stderr: 'warning: something' });
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'some-command' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.stderr).toBe('warning: something');
            expect(data.exitCode).toBe(0);
        });
    });

    describe('Command failure', () => {
        it('should return exitCode and output when command fails', async () => {
            const error = Object.assign(new Error('Command failed'), {
                stdout: '',
                stderr: 'command not found',
                code: 127,
            });

            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: Error) => void;
                cb(error);
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'nonexistent-command' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.exitCode).toBe(127);
            expect(data.stderr).toBe('command not found');
        });

        it('should return exitCode 1 when error has no numeric code', async () => {
            const error = Object.assign(new Error('Some error'), {
                stdout: 'partial output',
                stderr: 'error output',
            });

            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: Error) => void;
                cb(error);
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'failing-command' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.exitCode).toBe(1);
            expect(data.stdout).toBe('partial output');
        });
    });

    describe('Timeout handling', () => {
        it('should return 408 when command is killed due to timeout', async () => {
            const error = Object.assign(new Error('Command failed'), {
                killed: true,
                stdout: '',
                stderr: '',
            });

            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: Error) => void;
                cb(error);
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'sleep 100' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(408);
            expect(data.error).toBe('Command timed out');
        });

        it('should return 408 when command receives SIGTERM', async () => {
            const error = Object.assign(new Error('Command failed'), {
                signal: 'SIGTERM',
                stdout: '',
                stderr: '',
            });

            mockExec.mockImplementation((_cmd, _opts, callback) => {
                const cb = callback as (err: Error) => void;
                cb(error);
                return {} as ReturnType<typeof exec>;
            });

            const response = await POST(createRequest({ command: 'sleep 100' }, VALID_API_KEY));
            const data = await response.json();

            expect(response.status).toBe(408);
            expect(data.error).toBe('Command timed out');
        });

        it('should cap timeout at MAX_TIMEOUT_MS (60000)', async () => {
            mockExec.mockImplementation((_cmd, opts, callback) => {
                const cb = callback as (err: null, result: { stdout: string; stderr: string }) => void;
                const options = opts as { timeout?: number };
                expect(options.timeout).toBe(60000);
                cb(null, { stdout: 'ok', stderr: '' });
                return {} as ReturnType<typeof exec>;
            });

            // Request a timeout larger than max (120000 > 60000)
            await POST(createRequest({ command: 'echo ok', timeout: 120000 }, VALID_API_KEY));
        });

        it('should use default timeout when timeout is not provided', async () => {
            mockExec.mockImplementation((_cmd, opts, callback) => {
                const cb = callback as (err: null, result: { stdout: string; stderr: string }) => void;
                const options = opts as { timeout?: number };
                expect(options.timeout).toBe(30000);
                cb(null, { stdout: 'ok', stderr: '' });
                return {} as ReturnType<typeof exec>;
            });

            await POST(createRequest({ command: 'echo ok' }, VALID_API_KEY));
        });

        it('should use default timeout when timeout is invalid', async () => {
            mockExec.mockImplementation((_cmd, opts, callback) => {
                const cb = callback as (err: null, result: { stdout: string; stderr: string }) => void;
                const options = opts as { timeout?: number };
                expect(options.timeout).toBe(30000);
                cb(null, { stdout: 'ok', stderr: '' });
                return {} as ReturnType<typeof exec>;
            });

            await POST(createRequest({ command: 'echo ok', timeout: -1 }, VALID_API_KEY));
        });
    });
});
