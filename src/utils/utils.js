/**
 * Extends multiple object into one
 * @param {Boolean} deep Enable extend for deep object properties
 * @param {Array} objects List of objects to merged
 * @return {Object} Objects merged into one
 */
export const extend = (deep = false, ...objects) => {

  let extended = {};

  // Merge the object into the extended object
  let merge = obj => {
    for(let prop in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, prop)) {
        // If deep merge and property is an object, merge properties
        if(deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        }
        else {
          extended[prop] = obj[prop];
        }
      }
    }
  }

  // Loop through each object and conduct a merge
  objects.forEach(object => {
    merge(object);
  });

  return extended;
};

/**
 * Get values from a form
 * @param {HTMLElement} form element
 * @return {Object} json values
 */
export const formValues = (form) => {

  const formData = new FormData(form);

  let object = {};

  formData.forEach((value, key) => {
    if(!Reflect.has(object, key)){
      object[key] = value;
      return;
    }
    if(!Array.isArray(object[key])){
      object[key] = [object[key]];
    }
    object[key].push(value);
  });

  return object;
};
