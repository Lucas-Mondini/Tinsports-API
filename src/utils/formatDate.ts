export default class FormatDate
{
  static dateToDatabase(date: string, hour: string)
  {
    const formatDate = date.split('/');
    const newDate = new Date(`${formatDate[2]}-${formatDate[1]}-${formatDate[0]} ${hour}`);

    return newDate;
  }
}
