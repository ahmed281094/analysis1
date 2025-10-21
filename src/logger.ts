const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;

const COLOR = {
	debug: "\x1b[36m",
	info: "\x1b[32m",
	warn: "\x1b[33m",
	error: "\x1b[31m",
	reset: "\x1b[0m",
};

const envLevel = (process.env.LOG_LEVEL as Level) || "debug";
const currentLevelValue = LEVELS[envLevel] ?? LEVELS.debug;

function formatMessage(
	level: Level,
	moduleName: string | undefined,
	msg: string,
) {
	const timestamp = new Date().toISOString();
	const modulePart = moduleName ? `[${moduleName}] ` : "";
	return `${COLOR[level]}[${timestamp}] ${level.toUpperCase()}: ${modulePart}${msg}${COLOR.reset}`;
}

function shouldLog(level: Level) {
	return LEVELS[level] >= currentLevelValue;
}

export interface Logger {
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	child: (moduleName: string) => Logger;
}

function createLogger(moduleName?: string): Logger {
	function formatArgs(args: unknown[]) {
		return args
			.map((a) => {
				if (typeof a === "string") return a;
				try {
					return JSON.stringify(a);
				} catch {
					return String(a);
				}
			})
			.join(" ");
	}

	return {
		debug: (...args: unknown[]) => {
			if (!shouldLog("debug")) return;
			console.debug(formatMessage("debug", moduleName, `${formatArgs(args)}`));
		},
		info: (...args: unknown[]) => {
			if (!shouldLog("info")) return;
			console.log(formatMessage("info", moduleName, `${formatArgs(args)}`));
		},
		warn: (...args: unknown[]) => {
			if (!shouldLog("warn")) return;
			console.warn(formatMessage("warn", moduleName, `${formatArgs(args)}`));
		},
		error: (...args: unknown[]) => {
			if (!shouldLog("error")) return;
			console.error(formatMessage("error", moduleName, `${formatArgs(args)}`));
		},
		child: (mName: string) => createLogger(mName),
	};
}

const logger = createLogger();
export default logger;
