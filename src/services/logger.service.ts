export class Logger {
  static success(...message: string[]) {
    console.log(`✅ Success: ${message}`);
  }

  static error(...message: string[]) {
    console.error(`❌ Fail: ${message}`);
  }
}
