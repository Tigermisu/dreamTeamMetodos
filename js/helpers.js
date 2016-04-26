/*
    Nombre: helpers.js
    Descripción: Contiene al objeto helpers, el cual es usado por el resto de la aplicación para asistir en ciertas tareas.
    Fecha de creación: 6 de abril de 2016
    Fecha de modificación: 21 de abril de 2016
    Autor original: Christopher Jáquez Prado
    Autor de última modificación: Christopher Jáquez Prado
    Descripción de última modificación: Se agegaron comentarios detallados
    Llamado por: main.js, methods.js
    Llama a: Nada.
*/

/*
    Objeto helpers, contiene diversas funciones que asisten tanto a los métodos como a la interfaz gráfica
*/
var helpers = {
    /*
        Arreglo con los valores de los primeros 17 factoriales
    */
    factorials: [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880,
        3628800, 39916800, 479001600, 6227020800, 87178291200,
        1307674368000, 20922789888000
    ],

    /*
        Determina si una ecuación es válida. Recibe una cadena con la ecuación, regresa un booleano.
    */
    isValidInput: function(eq, x) {
        try {
            var num = helpers.eval(eq, x);
        } catch (e) {
            return false;
        }
        return !isNaN(num);
    },

    /*
        Extrae los coeficientes de una función de x. Recibe una cadena con la ecuación, regresa un arreglo con los coeficientes y el grado de la función.
    */
    getCoefficients: function(eq) {
        var coefficients = [];
        var grades = [];
        var regex = /(x\^)(\d*)/gi;
        var matches;
        while (matches = regex.exec(eq)) {
            grades.push(matches[2]);
        }
        var grade = Math.max.apply(Math, grades);
        var coefficient = 0;
        for (var i = grade; i > 1; i--) {
            var pattern = new RegExp("((\\+|\\-)?\\d*\\.?\\d*)(x\\^" + i + ")");
            match = eq.match(pattern);
            coefficient = (match === null) ? 0 : match[1];
            coefficient = (coefficient == "+") ? 1 : (coefficient == "-") ? -1 : coefficient;
            coefficients.push((coefficient === "") ? 1 : coefficient);
        }
        var res;
        try {
            var match = eq.match(/(((\+|\-)?\d*\.?\d*)(x)(\+|\-)|(((\+|\-)?\d*\.?\d*)(x))$)/);
            res = match[2];
            res = (res === undefined) ? match[7] : res;
            res = (res == "+") ? 1 : (res == "-") ? -1 : res;
            coefficients.push((res === "") ? 1 : res);
        } catch (e) {
            coefficients.push(0);
        }
        try {
            coefficients.push(eq.match(/(\+|\-)(\d*\.?\d+)$|(\+|\-)(\d*\.?\d+)(\+|\-)|(^\d*\.?\d+$)/)[0]);
        } catch (e) {
            coefficients.push(0);
        }
        for (c in coefficients) {
            coefficients[c] = parseFloat(coefficients[c]);
        }
        if (grade == -Infinity) grade = 1;
        return [coefficients, grade];
    },

    /*
        Evalúa una función de x en el punto dado. Recibe una cadena, regresa un flotante.
    */
    eval: function(str, x) {
        var lstr = str.replace(/(\d)(x)/gi, '$1*x');
        lstr = lstr.replace(/(ln)(\(.*\))/, 'Math.log$2');
        lstr = lstr.replace(/(e\^)(\(.*\))/, 'Math.pow(Math.E, $2)');
        lstr = lstr.replace(/(x)(\^)(\d*)/gi, 'Math.pow(x,$3)');
        try {
            return eval(lstr);
        } catch (e) {
            throw "Ecuación inválida.";
        }
    },

    /*
        Obtiene una serie de valores de y que se emplea para graficar ecuaciones.
        Recibe una cadena con la ecuación, su grado y un valor de x intermedio para graficar.
        Se puede entregar una segunda ecuación, para la cual también obtendrá los puntos.
        Regresa un objeto compuesto para ser empleado por la utilidad graficadora.
    */
    getChartData: function(eq, grade, x, eq2) {
        var chartMax = Math.floor(40 / grade);
        return {
            labels: function() {
                for (var i = 0, l = []; i <= chartMax; i++) {
                    l.push((x - chartMax / 2 + i).toFixed(2))
                }
                return l;
            }(),
            series: function() {
                for (var i = 0, s = []; i <= chartMax; i++) {
                    var xVal = x - chartMax / 2 + i;
                    s.push(helpers.eval(eq, xVal));
                }
                if (eq2 != null) {
                    for (var i = 0, t = []; i <= chartMax; i++) {
                        var xVal = x - chartMax / 2 + i;
                        t.push(helpers.eval(eq2, xVal));
                    }
                    return [s, t]
                }
                return [s];
            }()
        }
    }
}