type Object = {
  delete: () => void;
}

export default class DefaultController {
  protected async destroyObjectArray(objects: Object[]) {
    if (objects.length > 0) {
      for (const object of objects) {
        object.delete();
      }
    }
  }
}