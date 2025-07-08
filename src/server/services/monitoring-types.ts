/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
/* eslint-disable no-magic-numbers */
// Copy-pasted types from applicationinsights. The exports there do not work with ESNEXT.

/**
 * Defines the level of severity for the event.
 */
export enum SeverityLevel {
  Verbose = 0,
  Information = 1,
  Warning = 2,
  Error = 3,
  Critical = 4,
}

export interface Telemetry {
  /**
   * Telemetry time stamp. When it is not specified, current timestamp will be used.
   */
  time?: Date;
  /**
   * Additional data used to filter events and metrics in the portal. Defaults to empty.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * An event-specific context that will be passed to telemetry processors handling this event before it is sent. For a context spanning your entire operation, consider appInsights.getCorrelationContext
   */
  contextObjects?: {
    [name: string]: any;
  };
  /**
   * The context tags to use for this telemetry which overwrite default context values
   */
  tagOverrides?: {
    [key: string]: string;
  };
}

export interface ExceptionTelemetry extends Telemetry {
  /**
   * Exception thrown
   */
  exception: Error;
  /**
   * Metrics associated with this exception, displayed in Metrics Explorer on the portal. Defaults to empty
   */
  measurements?: {
    [key: string]: number;
  };
  /**
   * Exception severity level
   */
  severity?: SeverityLevel;
}

export interface TraceTelemetry extends Telemetry {
  /**
   * Trace message
   */
  message: string;
  /**
   * Trace severity level
   */
  severity?: SeverityLevel;
}

/**
 * The abstract common base of all domains.
 */
export declare class Domain {
  constructor();
}

export declare class RequestData extends Domain {
  /**
   * Schema version
   */
  ver: number;
  /**
   * Identifier of a request call instance. Used for correlation between request and other telemetry items.
   */
  id: string;
  /**
   * Source of the request. Examples are the instrumentation key of the caller or the ip address of the caller.
   */
  source: string;
  /**
   * Name of the request. Represents code path taken to process request. Low cardinality value to allow better grouping of requests. For HTTP requests it represents the HTTP method and URL path template like 'GET /values/{id}'.
   */
  name: string;
  /**
   * Request duration in format: DD.HH:MM:SS.MMMMMM. Must be less than 1000 days.
   */
  duration: string;
  /**
   * Result of a request execution. HTTP status code for HTTP requests.
   */
  responseCode: string;
  /**
   * Indication of successfull or unsuccessfull call.
   */
  success: boolean;
  /**
   * Request URL with all query string parameters.
   */
  url: string;
  /**
   * Collection of custom properties.
   */
  properties: any;
  /**
   * Collection of custom measurements.
   */
  measurements: any;
  constructor();
}

/**
 * Stack frame information.
 */
declare class StackFrame {
  /**
   * Level in the call stack. For the long stacks SDK may not report every function in a call stack.
   */
  level: number;
  /**
   * Method name.
   */
  method: string;
  /**
   * Name of the assembly (dll, jar, etc.) containing this function.
   */
  assembly: string;
  /**
   * File name or URL of the method implementation.
   */
  fileName: string;
  /**
   * Line number of the code implementation.
   */
  line: number;
  constructor();
}

/**
 * Exception details of the exception in a chain.
 */
export declare class ExceptionDetails {
  /**
   * In case exception is nested (outer exception contains inner one), the id and outerId properties are used to represent the nesting.
   */
  id: number;
  /**
   * The value of outerId is a reference to an element in ExceptionDetails that represents the outer exception
   */
  outerId: number;
  /**
   * Exception type name.
   */
  typeName: string;
  /**
   * Exception message.
   */
  message: string;
  /**
   * Indicates if full exception stack is provided in the exception. The stack may be trimmed, such as in the case of a StackOverflow exception.
   */
  hasFullStack: boolean;
  /**
   * Text describing the stack. Either stack or parsedStack should have a value.
   */
  stack: string;
  /**
   * List of stack frames. Either stack or parsedStack should have a value.
   */
  parsedStack: StackFrame[];
  constructor();
}

/**
 * An instance of Exception represents a handled or unhandled exception that occurred during execution of the monitored application.
 */
export declare class ExceptionData extends Domain {
  /**
   * Schema version
   */
  ver: number;
  /**
   * Exception chain - list of inner exceptions.
   */
  exceptions: ExceptionDetails[];
  /**
   * Severity level. Mostly used to indicate exception severity level when it is reported by logging library.
   */
  severityLevel: SeverityLevel;
  /**
   * Identifier of where the exception was thrown in code. Used for exceptions grouping. Typically a combination of exception type and a function from the call stack.
   */
  problemId: string;
  /**
   * Collection of custom properties.
   */
  properties: any;
  /**
   * Collection of custom measurements.
   */
  measurements: any;
  constructor();
}
