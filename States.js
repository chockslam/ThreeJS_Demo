
/**
 * Proxy Controller that represents a collection of available animations needed for states.
 * Idea taken from SimonDev (2020). The code was adjusted for the sake of compatability with application where needed.
 * The SimonDev's code contains 4 states. My code contains 7 states.
 */
export default class ControllerProxy {
    constructor(anims) {
      this.animations = anims;
    }
  };

/**
 * Abstract State class. Root CLass for other states
 * Idea taken from SimonDev (2020). The code was adjusted for the sake of compatability with application where needed.
 */
class State {
    constructor(parent) {
      this.parent = parent; // Accessing CharacterFSM class without instantiating this one.
    }
  
    /**
     * Switching animation and cross-fading between animations when entering relevant states for the sake of smoothness of character's movement.
     * @param {*} prevState - previous animation to cross-fade from in order to make animations more smooth
     */
    Enter(prevState) {}
    /**
     * Update the state
     */
    Update(input) {}
  };
  

/**
 * Walk state
 */
export class WalkState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'walk';
    }
  
    Enter(prevState) {
      const curAction = this.parent.proxy.animations['walk'].action;
      //If There is animation
      if (prevState) {
        const prevAction = this.parent.proxy.animations[prevState.Name].action;
  
        curAction.enabled = true;
        // Sync, crossfade and make transition smooth
        if (prevState.Name == 'run'||prevState.Name == 'walkback') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        }
        else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }
        // crossfade and play animation
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  

    Update(input) {
      //If pressing shift - run
      if (input.keys.forward) {
        if (input.keys.shift) {
          this.parent.SetState('run');
        }
        return;
      }
      //if not walking - go to idle state
      this.parent.SetState('idle');
    }
  };

/**
 * Walk Back State
 */
export class WalkBackState extends State{
  constructor(parent) {
    super(parent);
  }
  
  get Name() {
    return 'walkback';
  }
  
  Enter(prevState) {
    const curAction = this.parent.proxy.animations['walkback'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;

      curAction.enabled = true;
      // Sync, crossfade and make transition smooth
      if (prevState.Name == 'runback'||prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      }
      else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  // if shift is pressed during this state - run, else do not do anything
  Update(input) {
    if (input.keys.backward) {
      if (input.keys.shift) {
        this.parent.SetState('runback');
      }
      return;
    }
    //if not walking - go to idle state
    this.parent.SetState('idle');
  }
}
export class TurnRightState extends State{
  constructor(parent) {
    super(parent);
  }
  
  get Name() {
    return 'turnright';
  }
  
  Enter(prevState) {
    const curAction = this.parent.proxy.animations['turnright'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;

      curAction.enabled = true;
      // Sync, crossfade and make transition smooth
      if (prevState.Name == 'idle'||prevState.Name == 'walk'||prevState.Name == 'walkback') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      }
      else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  // if shift is pressed during this state - run, else do not do anything
  Update(input) {
    if (input.keys.right) {
      if (input.keys.forward) {
        this.parent.SetState('walk');
      }
      if (input.keys.backward) {
        this.parent.SetState('walkback');
      }
      return;
    }
    //if not walking - go to idle state
    this.parent.SetState('idle');
  }
}
export class TurnLeftState extends State{
  constructor(parent) {
    super(parent);
  }
  
  get Name() {
    return 'turnleft';
  }
  
  Enter(prevState) {
    const curAction = this.parent.proxy.animations['turnleft'].action;
    if (prevState) {
      const prevAction = this.parent.proxy.animations[prevState.Name].action;

      curAction.enabled = true;
      // if the previous state is run state - synch walking and running, else just crossfade
      if (prevState.Name == 'idle'||prevState.Name == 'walk'||prevState.Name == 'walkback') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      }
      else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  // if shift is pressed during this state - run, else do not do anything
  Update(input) {
    if (input.keys.left) {
      if (input.keys.forward) {
        this.parent.SetState('walk');
      }
      if (input.keys.backward) {
        this.parent.SetState('walkback');
      }
      return;
    }
    //if not walking - go to idle state
    this.parent.SetState('idle');
  }
}
/**
 * Run State
 */
export class RunState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'run';
    }
  
    Enter(prevState) {
      const curAction = this.parent.proxy.animations['run'].action;
      if (prevState) {
        const prevAction = this.parent.proxy.animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        if (prevState.Name == 'walk'||prevState.Name == 'runback') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Update(input) {
      if (input.keys.forward) {
        if (!input.keys.shift) { //if shift is not pressed - enter walk state.
          this.parent.SetState('walk');
        }
        return;
      }
      if (input.keys.backward) {
        if (!input.keys.shift) { //if shift is not pressed - enter walk state.
          this.parent.SetState('walkback');
        }
        this.parent.SetState('runback');
        return;
      }
  
      this.parent.SetState('idle');
    }
  };

  export class RunBackState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'runback';
    }
  
    Enter(prevState) {
      const curAction = this.parent.proxy.animations['runback'].action;
      if (prevState) {
        const prevAction = this.parent.proxy.animations[prevState.Name].action;
  
        curAction.enabled = true;
  
        if (prevState.Name == 'walkback' || prevState.Name == 'run') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration;
          curAction.time = prevAction.time * ratio;
        } else {
          curAction.time = 0.0;
          curAction.setEffectiveTimeScale(1.0);
          curAction.setEffectiveWeight(1.0);
        }
  
        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
      } else {
        curAction.play();
      }
    }
  
    Update(input) {
      if (input.keys.backward) {
        if (!input.keys.shift) { //if shift is not pressed - enter walk state.
          this.parent.SetState('walkback');
        }
        return;
      }
      if (input.keys.forward) {
        if (!input.keys.shift) { //if shift is not pressed - enter walk state.
          this.parent.SetState('walk');
        }
        this.parent.SetState('run');
        return;
      }
  
      this.parent.SetState('idle');
    }
  };

  
  
  /**
   * 
   * Idle state - default state of a character
   * 
   */
export class IdleState extends State {
    constructor(parent) {
      super(parent);
    }
  
    get Name() {
      return 'idle';
    }
  
    /**
     * Responsible for playing Idle animation and cross-fading from previous animation
     * @param prevState  
     */
    Enter(prevState) {
      //accesses animations contained in proxy character from FSM.
      const idleAction = this.parent.proxy.animations['idle'].action;
      //if previous state exists - crossfade
      if (prevState) {
        //Code for cross-fade start
        const prevAction = this.parent.proxy.animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
        //Code for cross-fade ends 
        idleAction.play(); //play animation
      } else {
        idleAction.play(); //play animation
      }
    }
  

    //Code for transition from Idle state to other states
    Update(input) {
      if (input.keys.forward) {
        this.parent.SetState('walk'); //if backwards or forward is pressed - enter walkstate
      }
      if (input.keys.backward) {
        this.parent.SetState('walkback'); //if backwards or forward is pressed - enter walkstate
      } 
      if (input.keys.right) {
        this.parent.SetState('turnright'); //if backwards or forward is pressed - enter walkstate
      }
      if (input.keys.left) {
        this.parent.SetState('turnleft'); //if backwards or forward is pressed - enter walkstate
      }
    }
  };
  
  