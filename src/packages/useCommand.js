import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./events";

export function useCommand(data) {
  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
    destroyArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = () => {
      if (command.name !== 'drag') {
        const { cb } = command.execute();
        cb();
      } else {
        const { back, forward } = command.execute()
        forward()
        let {queue,current} = state

        if(queue.length > 0){
          queue = queue.slice(0,current + 1)
          state.queue = queue
        }

        queue.push({back,forward})
        state.current = current + 1
        
      }

    };
  };

  const commandList = [
    {
      name: "forward",
      keyboard: "ctrl+y",
      execute() {
        return {
          cb() {
            let item = state.queue[state.current + 1]
            if(item){
              item.forward && item.forward()
              state.current++
            }
          },
        };
      },
    },
    {
      name: "back",
      keyboard: "ctrl+z",
      execute() {
        return {
          cb() {
            if(state.current == -1)return 
            let item = state.queue[state.current]
            if(item){
              item.back && item.back()
              state.current--
            }
          },
        };
      },
    },
    {
      name: "drag",
      pushQueue: true,
      init() {
        this.before = null;
        const start = () => {
          this.before = deepcopy(data.value.blocks)
        };
        const end = () => {
          state.commands.drag();
        }
        events.on("start", start);
        events.on("end", end);

        return () => {
          events.off("start", start);
          events.off("end", end);
        };
      },
      execute() {
        let before = this.before;
        let after = data.value.blocks;
        return {
          back() {
            data.value = { ...data.value, blocks: before };
          },
          forward() {
            data.value = { ...data.value, blocks: after };
          }
        };
      },
    },
  ];

  commandList.forEach((i) => {
    registry(i);
  });

  (() => {
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init())
    );
  })();

  onUnmounted(() => {
    state.destroyArray.forEach((fn) => fn && fn());
  });


  return state;
}
