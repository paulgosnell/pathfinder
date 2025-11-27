import '@testing-library/jest-dom'

// Polyfill for web streams APIs used by AI SDK
// Node.js 18+ has these built-in in the 'stream/web' module
import { TransformStream, ReadableStream, WritableStream } from 'stream/web'

global.TransformStream = TransformStream
global.ReadableStream = ReadableStream
global.WritableStream = WritableStream

// TextEncoder/TextDecoder polyfill for Node.js test environment
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
