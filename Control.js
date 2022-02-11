/**
 * Class records keyup and keydown events
 * WASD - for moving the character
 * SPACE - special action
 * SHIFT - RUN!
 */
export default class ControllerInput {
    constructor() {
      this.init();    
    }
  
    init() {
      // BOOL Collection of keys. Default to false
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
      };
    // Adding event listeners to capture the key
      document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }
    /**
     * Callback for key down 
     * Key is pressed set to TRUE.
    */
    onKeyDown(event) {
      switch (event.keyCode) {
        case 87: // w
          this.keys.forward = true;
          break;
        case 65: // a
          this.keys.left = true;
          break;
        case 83: // s
          this.keys.backward = true;
          break;
        case 68: // d
          this.keys.right = true;
          break;
        case 32: // SPACE
          this.keys.space = true;
          break;
        case 16: // SHIFT
          this.keys.shift = true;
          break;
      }
    }
  /**
   * Callback for keyup
   * Key is released - set to FALSE.
   */
    onKeyUp(event) {
      switch(event.keyCode) {
        case 87: // w
          this.keys.forward = false;
          break;
        case 65: // a
          this.keys.left = false;
          break;
        case 83: // s
          this.keys.backward = false;
          break;
        case 68: // d
          this.keys.right = false;
          break;
        case 32: // SPACE
          this.keys.space = false;
          break;
        case 16: // SHIFT
          this.keys.shift = false;
          break;
      }
    }
  };