import { v5 as uuid } from 'uuid';

// In order to make this feature extensible, we allow for different types of events (e.g. REGULAR or MULTITHREADED, etc.)
// The shared event key identifies the type of call being made as the render switch and main switch communicate. In most
// cases there would be a shared constants file which both the main and render switch modules would import, but because
// the Block DX front end is built in Angular it makes it difficult to share code that way.
const switchEventKeys = {
  REGULAR: 'aaaafdc5-9186-4aff-8731-52159ff92d85'
};

class RenderSwitch {

  async send(key, params, multiThread = false) {
    const { ipcRenderer } = window.electron;
    const id = uuid();
    const data = await new Promise((resolve, reject) => {
      ipcRenderer.once(id, (e, err, res) => {
        if(err) {
          reject(new Error(err.message));
        } else {
          resolve(res);
        }
      });
      ipcRenderer.send(switchEventKeys.REGULAR, id, key, params);
    });
    return data;
  }

}

const renderSwitch = new RenderSwitch();

export {renderSwitch};
