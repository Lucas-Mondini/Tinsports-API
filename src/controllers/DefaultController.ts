import moment from "moment-timezone";

type Object = {
  delete: () => void;
  updateOne: (data: any) => void;
  save: () => void;
}

export default class DefaultController {
  protected async destroyObjectArray(objects: Object[]) {
    if (objects.length > 0) {
      for (const object of objects) {
        object.delete();
      }
    }
  }

  protected async softDeleteArray(objects: Object[]) {
    if (objects.length > 0) {
      for (const object of objects) {
        await object.updateOne({deletedAt: moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm")});
        await object.save();
      }
    }
  }
}