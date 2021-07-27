export default class FormatStrings {
  static formatMoneyToUser(value: number) {

    if (!value) return;

    let money = String(value.toFixed(2)).replace('.', ',');
    let thousands = "";

    switch (money.length) {
      case 7:
        thousands = money.substring(1, money.length);
        money = `${money[0]}.${thousands}`;
        break;
      case 8:
        thousands = money.substring(2, money.length);
        money = `${money.substring(0, 2)}.${thousands}`;
        break;
      case 9:
        thousands = money.substring(3, money.length);
        money = `${money.substring(0, 3)}.${thousands}`;
        break;
    }

    return `R$ ${money}`;
  }

  static formatMoneyToDatabase(value: string) {
    if (!value) return;

    const money = value.replace(',', '.');

    if (money.indexOf('.') !== -1) {
      money.replace('.', "");
    }

    return Number(money).toFixed(2);
  }
}