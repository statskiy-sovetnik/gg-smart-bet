export default class User {
  account: string;
  balanceInWei = '';
  isOwnerOfGGbet = false;

  constructor(account: string) {
    this.account = account;
  }
}
