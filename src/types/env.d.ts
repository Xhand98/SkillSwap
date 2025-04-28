export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      test: string;
      test_dos: number;
    }
  }
}
