import { axiosInstance } from './axios';
import { settings } from '../models';
import { GoResponse, fail, ok } from './errorHandling';
import { Wfm } from './types';

// Docs https://warframe.market/api_docs

// Properties commented out are not needed for this app, at this time.


type ObjectID = string

type CreateOrder = {
  item: ObjectID,
  order_type: Wfm.OrderType,
  platinum: number,
  quantity: number,
  visible: boolean,
  rank?: number,
  sub_type?: string,
}

const wfmClient = {
  auth: {
    login: (email: string, password: string): GoResponse<Wfm.User> => (axiosInstance.post('/auth/signin', { email, password })
      .then(response => {
        let access_token = response.headers['set-cookie'] as string|undefined
        if (access_token) {
          access_token = access_token.slice(4)
          settings.update({ access_token });
          return ok(response.data.user as Wfm.User)
        }
        return fail(new Error("This shouldn't happen"))
      })
      .catch((err) => {
        console.error(err);
        return fail(err)
      })
    ),
    async logout() {
      await settings.set('access_token', undefined);
    }
  },

  items: {
    list: (): GoResponse<Wfm.Item[]> => (axiosInstance.get('/items')
      .then(response => ok(response.data.payload.items))
      .catch(err => {
        console.error(err);
        return fail(err)
      })
    ),
  },

  order: {
    async list() {},
    async create(props: CreateOrder) {
      return axiosInstance.post('/profile/orders', props)
        .then(response => ok(response.data))
        .catch(err => {
          console.error(err);
          return fail(err)
        })
    },
    async update() {},
    async delete() {},
  },
}

export default wfmClient;
