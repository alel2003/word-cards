declare module 'express' {
  export interface Request {
    user: {
      sub: number;
      email: string;
    };
    cookies: {
      accessToken?: string;
    };
  }

  export interface Response {
    cookie(name: string, value: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
  }
}
