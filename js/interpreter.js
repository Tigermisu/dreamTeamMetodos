/*
    Nombre: interpreter.js
    Descripción: Contiene al objeto interpreter, el cual es empleado para obtener conclusiones sobre los resultados de ciertos métodos.
    Fecha de creación: 6 de abril de 2016
    Fecha de modificación: 21 de abril de 2016
    Autor original: Christopher Jáquez Prado
    Autor de última modificación: Christopher Jáquez Prado
    Descripción de última modificación: Se agegaron comentarios detallados
    Llamado por: main.js
    Llama a: Nada.
*/

/*
    Objeto interpreter, deriva conclusiones en lenguaje natural.
*/
var interpreter = {
    /*
        Reconoce y clasifica los puntos críticos de una función. Recibe una cadena con la ecuación, un valor a evaluar y el grado de la función.
        Regresa una cadena con la conclusión adecuada.
    */
    criticalPoints: function (equation, x, grade) {
        var fx = methods.horner(equation, 0, x),
            fxx = methods.horner(equation, 1, x),
            fxxx = methods.horner(equation, 2, x),
            base = " en el punto (" + x + ", " + fx + ")."
        if (Math.abs(fxxx) < 0.00000000001 && !(grade == 1)) {
            return "La función tiene un punto de inflexión" + base;
        }
        if (Math.abs(fxx) < 0.00000000001 && !(grade == 1)) {
            if (fxxx > 0) {
                return "La función tiene un mínimo" + base;
            } else {
                return "La función tiene un máximo" + base;
            }
        } else {
            return "La función no tiene un punto crítico" + base;
        }
    },

    /*
        Reconoce y clasifica las raíces de una función. Recibe una cadena con la ecuación, un valor a evaluar y el grado de la función.
        Regresa una cadena con la conclusión adecuada.
    */
    roots: function (eq, x, grade) {
        var base = "Se encontró una raíz en (" + x + ", 0).",
            fxx = methods.horner(eq, 1, x),
            fxxx = methods.horner(eq, 2, x);
        if (Math.abs(fxxx) < 0.00000000001 && !(grade == 1)) {
            return base + " La función tiene un punto de inflexión en esa área, por lo que hay al menos tres raíces en ese punto.";
        }
        if (Math.abs(fxx) < 0.00000000001 && !(grade == 1)) {
            if (fxxx > 0) {
                return base + " La función tiene un mínimo en ese punto, por lo que es una raíz multiple.";
            } else {
                return base + " La función tiene un mínimo en ese punto, por lo que es una raíz multiple.";
            }
        } else {
            return base + " Es un corte limpio.";
        }
    }
}