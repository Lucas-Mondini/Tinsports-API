type Object = {
  delete: () => void;
}

export default class DefaultController {
  protected async destroyObjectArray(objects: Object[]) {
    for (const object of objects) {
      object.delete();
    }
  }
}