import * as States from './States.js'

/**
 * Abstract Finite State Machine class represents the logic of characters states.
 * Idea taken from SimonDev (2020) - Character Control. The code was adjusted for the sake of compatability with application where needed.
 *  
 * */
class FSM{

    constructor() {
        this.states = {}; //collection of states
        this.currentState = null; //current state
      }
    
      /**
       * 
       * @param name string name of the state
       * @param type class that represents that state (from States.js)
       */
      AddState(name, type) {
        this.states[name] = type;
      }
    
      /**
       * Function helps to manage state changes. Actively used in concrete implementation of each state.
       */
      SetState(name) {
        //previous state
        const prevState = this.currentState;
        
        if (prevState) {
        // if the new state is the same state as previous one - return
          if (prevState.Name == name) {
            return;
          }
        }
        //Initialize the new state located in the dictionary
        const state = new this.states[name](this);
    
        //new current state
        this.currentState = state;
        //enter new state from previous state...
        state.Enter(prevState);
      }
    
      /**
       * Update current state
       * @param input 
       */
      Update(timeElapsed, input) {
        if (this.currentState) {
          this.currentState.Update(input);
        }
      }
}
/**
 * Concrete CharacterFSM class.
 * Idea taken from SimonDev (2020). The code was adjusted for the sake of compatability with application where needed.
 */
export default class CharacterFSM extends FSM{
    /**
     * @param proxy proxy character class that contains only anumation
     */
    constructor(proxy) {
        super();
        this.proxy = proxy;
        this.init();
      }
    
      //Add character specific states to the dictionary
      init() {
        this.AddState('idle', States.IdleState);
        this.AddState('turnright', States.TurnRightState);
        this.AddState('turnleft', States.TurnLeftState);
        this.AddState('walk', States.WalkState);
        this.AddState('walkback', States.WalkBackState);
        this.AddState('run', States.RunState);
        this.AddState('runback', States.RunBackState);
      }
}