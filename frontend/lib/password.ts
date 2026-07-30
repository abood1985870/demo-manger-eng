import passwordCore from './password-core.cjs';

export const hashPassword: (password: string) => string = passwordCore.hashPassword;
export const verifyPassword: (password: string, stored: string) => boolean = passwordCore.verifyPassword;
