import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const MAX_TIMEOUT_MS = 60000;
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Run a shell command on the server.
 * Requires the RUN_API_KEY environment variable to be set, and the caller must
 * supply the same value in the x-api-key request header.
 * @summary Execute a command and return its output
 * @tag Run
 * @body {object} - Request body containing command (string, required) and optional timeout (number, ms)
 * @response 200 - Command executed successfully
 * @response 400 - Missing or invalid command
 * @response 401 - Missing or invalid API key
 * @response 408 - Command timed out
 * @response 500 - Internal server error
 */
export async function POST(request: NextRequest) {
    const runApiKey = process.env.RUN_API_KEY;
    if (!runApiKey) {
        return NextResponse.json(
            { error: 'Run API key not configured' },
            { status: 500 }
        );
    }

    const providedKey = request.headers.get('x-api-key');
    if (!providedKey || providedKey !== runApiKey) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    let body: { command?: unknown; timeout?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { command, timeout } = body;

    if (!command || typeof command !== 'string' || command.trim() === '') {
        return NextResponse.json(
            { error: 'command is required and must be a non-empty string' },
            { status: 400 }
        );
    }

    const timeoutMs = typeof timeout === 'number' && timeout > 0
        ? Math.min(timeout, MAX_TIMEOUT_MS)
        : DEFAULT_TIMEOUT_MS;

    const startTime = Date.now();

    try {
        const { stdout, stderr } = await execAsync(command, {
            timeout: timeoutMs,
            maxBuffer: 10 * 1024 * 1024, // 10 MB
        });

        return NextResponse.json({
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode: 0,
            duration: Date.now() - startTime,
        });
    } catch (error) {
        const duration = Date.now() - startTime;

        const execError = error as NodeJS.ErrnoException & {
            killed?: boolean;
            signal?: string;
            stdout?: string;
            stderr?: string;
            code?: number;
        };

        if (execError.killed || execError.signal === 'SIGTERM') {
            return NextResponse.json(
                {
                    error: 'Command timed out',
                    stdout: execError.stdout || '',
                    stderr: execError.stderr || '',
                    duration,
                },
                { status: 408 }
            );
        }

        return NextResponse.json({
            stdout: execError.stdout || '',
            stderr: execError.stderr || execError.message || '',
            exitCode: typeof execError.code === 'number' ? execError.code : 1,
            duration,
        });
    }
}
