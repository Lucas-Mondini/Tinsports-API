export default class FormatDate{

  static dateToDatabase(date: string, hour: string){

    const formatDate = date.split('/');
    const newDate = new Date(`${formatDate[2]}-${formatDate[1]}-${formatDate[0]} ${hour}`);
    return newDate;
  }

  static toDateString(date: string){
    const formatDate = new Date(date);

    return `${formatDate.getDate()}/${formatDate.getMonth()}/${formatDate.getFullYear()}`
  }

  static hourToString(date: string){
    const formatHour = new Date(date);
    const hour = formatHour.getHours() >= 10 ? formatHour.getHours() : `0${formatHour.getHours()}`;
    const minutes = formatHour.getMinutes() >= 10 ? formatHour.getMinutes() : `0${formatHour.getMinutes()}`;

    return `${hour}:${minutes}`;
  }

}
