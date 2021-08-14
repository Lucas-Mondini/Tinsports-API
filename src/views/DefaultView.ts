import { Response } from 'express';

export default class DefaultView {
  protected treatError = async(res: Response, response: any) =>
  {
    if (response.status) {
      return res.status(response.status).json(response);
    }

    else {
      return res.status(200).json(response);
    }
  }
}