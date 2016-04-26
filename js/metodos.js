/*
    Nombre: metodos.js
    Descripción: Contiene la lógica de los métodos numéricos utilizados en la aplicación.
    Fecha de creación: 6 de abril de 2016
    Fecha de modificación: 21 de abril de 2016
    Autor original: Christopher Jáquez Prado
    Autor de última modificación: Christopher Jáquez Prado
    Descripción de última modificación: Se agegaron comentarios detallados
    Llamado por: main.js
    Llama a: helpers.js
*/


/*
    Objeto methods, contiene todos los métodos en forma de función, y las operaciones matriciales son otro objeto dentro del éste.
*/
var methods = {
    /*
        Método de horner. Recibe una ecuación, la derivada que se desea y el valor en la que se evalúa. Regresa el valor de la función según se requirió.
    */
    horner: function (eq, depth, value) {
        // Obtener coeficientes de la ecuación
        var coefficients = helpers.getCoefficients(eq)[0];
        // Realizar la división sintética
        for (var i = 0; i <= depth; i++) {
            for (var j = 0; j < coefficients.length - i; j++) {
                coefficients[j] = (j > 0) ? coefficients[j - 1] * value + coefficients[j] : coefficients[j];
            }
        }
        var result = coefficients[coefficients.length - 1 - depth] * helpers.factorials[depth];
        return isNaN(result) ? 0 : result;
    },

    /*
        Método de Newton-Rapshon, recibe una ecuación y un valor inicial, regresa la raíz encontrada.
    */
    newtonRapshon: function (equation, x1) {
        var startValue = (x1 == "") ? 0 : startValue = parseFloat(x1),
            iterations = 0,
            prev = Infinity,
            current = startValue,
            fx = 0,
            fdx = 0;
        // Se limita el bucle a 300 iteraciones.
        while (Math.abs(current - prev) > 0.00000000000001 && iterations < 300) {
            prev = current;
            fx = helpers.eval(equation, current);
            fdx = methods.horner(equation, 1, current);
            current -= fx / fdx;
            iterations++;
        }
        // Si el resultado es cercano a 0, se asume correcto.
        if (Math.abs(helpers.eval(equation, current)) < 1)
            return current;
        throw 'El método diverge';

    },

    /*
        Objeto que contiene todas las operaciones matriciales
    */
    matrixOps: {
        /*
            Multiplica una matriz por un escalar, recibe un arreglo bidimensional de tamaño M,N y un escalar. Regresa un arreglo bidimensional.
        */
        scalarMult: function (matrix, n) {
            if (n == 1) return matrix;
            var newMatrix = matrix;
            for (var i = 0; i < newMatrix.length; i++) {
                for (var j = 0; j < newMatrix[i].length; j++) {
                    newMatrix[i][j] *= n;
                }
            }
            return newMatrix;
        },

        /*
            Obtiene la inversa de una matriz. Recibe un arreglo bidimensional de tamaño N,N y regresa un arreglo bidimensional de tamaño N,N.
        */
        invert: function (matrix) {
            if (matrix.length != matrix[0].length)
                throw 'Se intentó obtener la inversa de una matriz no cuadrada';
            // Se emplea eliminación de Gauss-Jordan para obtener A^-1|I
            var identityMatrix = [],
                gjMatrix = matrix.slice(),
                rows = gjMatrix.length,
                cols = gjMatrix[0].length;
            // Se crea la matriz identidad
            for (var i = 0; i < rows; i++) {
                identityMatrix.push([]);
                for (var j = 0; j < cols; j++) {
                    identityMatrix[i][j] = (i == j) ? 1 : 0;
                }
            }
            // Se ejecuta el método de Gauss-Jordan
            for (var i = 0; i < rows; i++) {
                // Se define el nodo pivote
                var pivotNode = gjMatrix[i][i];
                // Si el pivote es 0, se cambia por el siguiente renglón si éste existe. 
                if(Math.abs(pivotNode) < 0.00000001 && i+1 < rows) {
                    var currentRow = [];
                    for(var c = 0; c < rows; c++) {
                        currentRow.push(gjMatrix[i][c]);
                        gjMatrix[i][c] = gjMatrix[i+1][c];
                        gjMatrix[i+1][c] = currentRow[c];
                    }
                    pivotNode = gjMatrix[i][i];
                }
                // El pivote, y todo su renglón, se divide entre el pivote.
                for (var j = 0; j < cols; j++) {
                    gjMatrix[i][j] /= pivotNode;
                    identityMatrix[i][j] /= pivotNode;
                }
                // Se actualiza la variable del pivote
                pivotNode = gjMatrix[i][i];
                // Se realizan las operaciones de renglón
                for (var h = i + 1; h < i + cols; h++) {
                    var divCoef = -gjMatrix[h % rows][i] / pivotNode;
                    for (var k = 0; k < cols; k++) {
                        gjMatrix[h % rows][k] += divCoef * gjMatrix[i][k];
                        identityMatrix[h % rows][k] += divCoef * identityMatrix[i][k];
                    }
                }
            }
            return identityMatrix;

        },

        /*
            Obtiene la determinante de una matriz de forma recursiva, recibe un arreglo bidimensional de tamaño N,N y regresa un arreglo bidimensional de tamaño N,N.
        */
        determinant: function (matrix) {
            if (matrix.length != matrix[0].length)
                throw 'Se intentó obtener el determinante de una matriz no cuadrada';
            if (matrix.length == 1) {
                return matrix[0][0];
            }
            if (matrix.length == 2) {
                //ad-bc
                return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
            }
            var rows = matrix.length,
                determinant = 0;
            // Segmentar la matriz
            for (var i = 0; i < rows; i++) {
                var subMatrix = []
                for (var j = 1; j < rows; j++) {
                    subMatrix.push([]);
                    for (var k = 0; k < rows; k++) {
                        if (k  < i) {
                            subMatrix[j - 1][k] = matrix[j][k];
                        } else if (k > i ) {
                            subMatrix[j - 1][k-1] = matrix[j][k];
                        }
                    }
                }
                // Obtener el determinante de los segmentos más pequeños
                var constant = matrix[0][i] * ((i % 2 == 0) ? 1 : -1);
                var subDeterminant = methods.matrixOps.determinant(subMatrix);
                determinant += constant * subDeterminant;
            }
            return determinant;

        },

        /*
            Transpone una matriz. Recibe un arreglo bidimensional, regresa un arreglo bidimensional
        */
        transpose: function (matrix) {
            var newMatrix = [];
            for (var i = 0; i < matrix[0].length; i++) {
                newMatrix.push([]);
                for (var j = 0; j < matrix.length; j++) {
                    newMatrix[i][j] = matrix[j][i];
                }
            }
            return newMatrix;
        },
        
        /*
            Suma o resta dos matrices. Recibe dos arreglo bidimensionales de tamaño M,N así como un booleano que indica si se desea sumar o restar.
            Regresa un arreglo bidimensional de tamaño M,N
        */
        addition: function (A, B, sum) {
            if (A.length != B.length || A[0].length != B[0].length)
                throw 'Se intentó sumar matrices de distintas dimensiones';
            var operator = sum ? 1 : -1,
                result = [];
            for (var i = 0; i < A.length; i++) {
                result.push([]);
                for (var j = 0; j < A[i].length; j++) {
                    result[i][j] = (parseFloat(A[i][j]) + parseFloat(operator * B[i][j]));
                }
            }
            return result;
        },

        /*
            Multiplica dos matrices. Recibe un arreglo bidimensional de tamaño N,M y otro de tamaño M,O y regresa un arreglo bidimensional de tamaño N,O.
        */
        multiplication: function (A, B) {
            if (A[0].length != B.length)
                throw 'Se intentó multiplcar dos matrices de tamaño incompatible';
            var result = [];
            for (var i = 0; i < A.length; i++) {
                result.push([]);
                for (var j = 0; j < B[0].length; j++) {
                    var dotProduct = 0;
                    for (var k = 0; k < B.length; k++) {
                        dotProduct += A[i][k] * B[k][j]
                    }
                    result[i][j] = dotProduct;
                }
            }
            return result;
        },
        
        /*
            Checa si una matriz aumentada es inconsistente. Recibe un arreglo bidimensional de tamaño N,M y regresa un booleano.
        */
        checkForAugmentedInconsistencies: function(A,B) {
            for(var i = 0; i < A.length; i++) {
                var nonzero = false;
                for(var j = 0; j < A.length; j++) {
                    nonzero = nonzero || A[i][j] != 0;
                }
                if(!nonzero && B[i][0] != 0) return true;
            }
            return false;
        }
    },
    
    /*
        Encuentra la intersección de dos ecuaciones por método de Newton Multivariable. 
        Recibe dos ecuaciones en función de x, un valor inicial para x y un valor inicial para y. Regresa el valor x del punto de intersección.  
    */
    newtonMultivariable: function(eq1, eq2, startX, startY) {
        var x = startX,
            y = startY;        
        for(var i = 0; i <= 300; i++) {
            var f1x = helpers.eval(eq1, x) - y,
                f1xx = methods.horner(eq1, 1, x),
                f2x = helpers.eval(eq2, x) - y,
                f2xx = methods.horner(eq2, 1, x),
                jacobian = [[f1xx, -1],[f2xx, -1]],
                fMatrix = [[f1x],[f2x]],
                inverseJacobian = methods.matrixOps.invert(jacobian),
                delta = methods.matrixOps.multiplication(inverseJacobian, fMatrix),
                error = Math.sqrt(Math.pow(delta[0],2) + Math.pow(delta[1],2));
            x -= delta[0];
            y -= delta[1];
            if(error < 0.0000000001) break;
            // Si después de 300 iteraciones no se ha encontrado una intersección, se asume divergencia.
            if(i == 300) throw 'El metodo diverge';
        }
        return(x);
    }
}