/**
 *  This module is used for live coding,
 *  by Sepand Ansari from the p5.js-editor (desktop version).
 *  Not active yet.
 */

var liveCodingEnabled = true;

codeChanged = function(codeContent) {

    //if live coding enabled and socket connection is established (e.g. code is running)
    if(liveCodingEnabled && io) {


      try {
        //TODO is there any way of doing a shallow parse since we just need global stuff (most likely not)
        var syntax = esprima.parse(codeContent);

      }
      catch(e) {

        return;
      }

        _.each(syntax.body, function(i) {

            if (i.type === 'FunctionDeclaration') {
              // Global functions: 


              //TODO: is there a better way of getting the content of the function than unparsing it?

              
              var name = i.id.name;
              var value = escodegen.generate(i.body).replace('\n','');

              var params = i.params.map(function(item) {
                return item.name;
              });
              
              checkForChangeAndEmit(name, 'function', value, params);

            }
            else if (i.type ==='ExpressionStatement' &&
                     i.expression.left && i.expression.left.type === 'MemberExpression' &&
                     i.expression.right && i.expression.right.type === 'FunctionExpression') {
              // functions declared as expression e.g Obj.prototype.foo = function() {}

              var name = escodegen.generate(i.expression.left);
              var value = escodegen.generate(i.expression.right.body).replace('\n','');

              var params = i.params.map(function(item) {
                return item.name;
              });
              
              checkForChangeAndEmit(name, 'function', value, params);

              
            }
            else if (i.type === 'VariableDeclaration') {
              // Global variables: 
              //console.log(i);

              var name = i.declarations[0].id.name;
              var value = i.declarations[0].init ? escodegen.generate(i.declarations[0].init) : null;

              // client should know if the value is number to parseFloat string that is received.
              var isNumber = i.declarations[0].init  && //it is initialized and ... 
                            ((i.declarations[0].init.type==='Literal' 
                                && typeof i.declarations[0].init.value === 'number')  //for numbers
                            || (i.declarations[0].init.type==='UnaryExpression' 
                                && typeof i.declarations[0].init.argument.value === 'number')); //for negative numbers
                            //TODO what else? is there any other type of parse tree for numbers?
              
              var type = isNumber ? 'number' : 'variable';

              if(i.declarations[0].init && i.declarations[0].init.type==="ObjectExpression") {
                //pass object type since it needs to be parsed on client
                type = 'object';
              }


              checkForChangeAndEmit(name, type, value);


            }
        });
      
    }

  };

var referenceURL = 'http://p5js.org/reference/'

function checkForChangeAndEmit(name, type, value, params) {
  console.log(name, type, value, params);
    //if object doesn't exist or has been changed, update and emit change.
    // if(!globalObjs[name]) {
    //   globalObjs[name] = {name: name, type: type, value: value, params: params};
    // }
    // else if( globalObjs[name].value !== value) {
    //   globalObjs[name] = {name: name, type: type, value: value, params: params};
    //   console.log('emitting', globalObjs[name]);
    //   io.emit('codechange', globalObjs[name]);
    // }

}