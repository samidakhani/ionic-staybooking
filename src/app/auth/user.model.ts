/* eslint-disable no-underscore-dangle */
export class User {

  constructor(public id: string, public email: string,
    public _token: string, public tokenExpirationDate: Date) {
  }

  get token() {
    if(!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    return this._token;
  }

  get timeoutDuration() {
    if(!this._token) {
      return 0;
    }
    return this.tokenExpirationDate.getTime() - new Date().getTime();
  }
}
