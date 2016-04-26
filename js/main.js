/*
    Nombre: main.js
    Descripción: Clase principal de la aplicación, se encarga de controlar tanto la interfaz gráfica como el flujo de los métodos. 
    Fecha de creación: 6 de abril de 2016
    Fecha de modificación: 21 de abril de 2016
    Autor original: Christopher Jáquez Prado
    Autor de última modificación: Christopher Jáquez Prado
    Descripción de última modificación: Se agegaron comentarios detallados
    Llamado por: Nada.
    Llama a: methods.js, helpers.js, interpreter.js
*/


/*
    JQ Document Ready - Esta funcion es llamada por el explorador cuando el DOM se encuentra listo para la ejecución de código.
*/
$(function() {
    // Inicializar la aplicación.
    main.init();
});

/*
    Clase principal de la aplicación, contiene tanto funciones como objetos que se enfocan a controlar el flujo de los métodos, recibir entradas y mostrar salidas,
    así como la navegación de la interfaz gráfica.
*/
var main = {
    /*
        Objeto que contiene configuraciones globales para las gráficas.   
    */
    chartOptions: {
        showPoint: false,
    },

    /*
        Función que se encarga de inicializar el programa, añadiendo los listeners necesarios a los eventos.
    */
    init: function() {
        $('[data-control]').click(function() {
            var target = $(this).data('control'),
                backHtml = '<img src="img/back.png" alt="Regresar" id="back" class="back">';
            $('.puntos').slideUp();
            $(target).prepend(backHtml).slideDown();
            $('#back').click(function() {
                $(target).find('input').val('');
                $('.puntos').slideDown();
                $(target).find('.results').slideUp();
                $(target).slideUp(function() {
                    $('#back').remove();
                });
            });
        });

        $('#oneCalc').click(main.one);

        $('#one input').keypress(function(e) {
            if (e.which == 13) {
                main.one();
            }
        });

        $('#twoCalc').click(main.two);

        $('#two input').keypress(function(e) {
            if (e.which == 13) {
                main.two();
            }
        });

        $('#doFive').click(main.five);

        main.three.initInputs();
        main.four.initInputs();
        main.six.init();
    },

    /*
        Función one - contiene toda la lógica necesaria para la ejecución del punto uno de los requerimientos
    */
    one: function() {
        var eq = $('#oneEq').val(),
            x = $('#oneX').val();
        if (!helpers.isValidInput(eq, x)) {
            alertify.alert("Ecuación inválida.");
            return false;
        }
        var fx = methods.horner(eq, 0, x),
            fxx = methods.horner(eq, 1, x),
            fxxx = methods.horner(eq, 2, x),
            grade = helpers.getCoefficients(eq)[1],
            chartData = helpers.getChartData(eq, grade, x);
        new Chartist.Line('#oneChart', chartData, main.chartOptions);
        $('#oneInter').html(interpreter.criticalPoints(eq, x, grade));
        $('#oneValues').html('').append('<p>f(x) = ' + fx + '</p>');
        $('#oneValues').append('<p>f\'(x) = ' + fxx + '</p>');
        $('#oneValues').append('<p>f\'\'(x) = ' + fxxx + '</p>');
        $('#one .results').slideDown();
    },

    /*
        Función two - contiene toda la lógica necesaria para la ejecución del punto dos de los requerimientos
    */
    two: function() {
        var eq = $('#twoEq').val(),
            x = $('#twoX').val();
        if (!helpers.isValidInput(eq, x)) {
            alertify.alert("Ecuación inválida.");
            return false;
        }
        try {
            var root = methods.newtonRapshon(eq, x);
            root = parseFloat(root.toFixed(6));
        } catch (e) {
            console.error(e);
            alertify.alert("El método diverge con el valor inicial especificado.")
            return false;
        }
        var grade = helpers.getCoefficients(eq)[1],
            chartData = helpers.getChartData(eq, grade, root);
        new Chartist.Line('#twoChart', chartData, main.chartOptions);
        $('#twoInter').html(interpreter.roots(eq, root, grade));
        $('#two .results').slideDown();
    },

    /*
        Objeto three - Contiene toda la lógica necesaria para la ejecución del punto tres de los requerimientos
    */
    three: {
        /*
            Variable de cadena que guarda la operación actualmente seleccionada
        */
        action: null,

        /*
            Inicializar campos y asignar listeners de eventos.
        */
        initInputs: function() {
            var baseInputHtml = '<div class="matrix-col"><input class="matrix-input" /></div>';
            $('.matrix').append('<div class="matrix-row">' + baseInputHtml + '</div>');
            $('#three .matrix').find('.matrix-col').append('<div class="row-label">1</div><div class="col-label">1</div>');

            $('#ARow, #ACol, #BRow, #BCol').change(function() {
                var matrixLetter = $(this).attr('id')[0],
                    rows = $('#' + matrixLetter + 'Row').val(),
                    columns = $('#' + matrixLetter + 'Col').val(),
                    matrix = $('#' + matrixLetter + 'Matrix');
                while (matrix.find('.matrix-row').length < rows) {
                    var length = matrix.find('.matrix-row').length + 1;
                    matrix.append('<div class="matrix-row"></div>');
                    matrix.find('.matrix-row').last().append(baseInputHtml).find('.matrix-col').append(
                        '<div class="row-label">' + length + '</div>');
                    for (var i = 1; i < columns; i++) {
                        matrix.find('.matrix-row').last().append(baseInputHtml);
                    }
                }
                while (matrix.find('.matrix-row').length > rows) {
                    matrix.find('.matrix-row').last().remove();
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length < columns) {
                    var firstMatrix = matrix.find('.matrix-row').first();
                    matrix.find('.matrix-row').each(function() {
                        $(this).append(baseInputHtml);
                    });
                    var i = matrix.find('.matrix-row').first().find('.matrix-col').length;
                    matrix.find('.matrix-row').first().find('.matrix-col').last()
                        .append('<div class="col-label">' + i++ + '</div>');
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length > columns) {
                    matrix.find('.matrix-row').each(function() {
                        $(this).find('.matrix-col').last().remove();
                    });
                }

                if (matrixLetter == 'A') {
                    $('#bWrap').slideUp();
                    if (rows != columns) {
                        $('#Inv, #Deter').prop('disabled', true);
                    } else {
                        $('#Inv, #Deter').prop('disabled', false);
                    }
                }
            });

            // Asignar tamaño inicial a la matríz
            $('#ARow').val('2').change();
            $('#ACol').val('2').change();
            
            // Selección de operación
            $('#matrix-options-wrapper button').click(function() {
                var clickedBtn = $(this).attr('id'),
                    rows = $('#ARow').val(),
                    columns = $('#ACol').val();
                if (['ApB', 'AmB', 'AxB'].indexOf(clickedBtn) != -1) {
                    main.three.action = clickedBtn;
                    $('#bWrap').slideDown();
                    $('#matrixOutputWrap').slideUp(function() {
                        $('#matrixOutput').remove();
                        $(this).css('display', 'block');
                    });
                    if (clickedBtn == 'ApB' || clickedBtn == 'AmB') {
                        $('#BRow').val(rows).change();
                        $('#BCol').val(columns).prop('disabled', true).change();
                    } else {
                        $('#BRow').val(columns).change();
                        $('#BCol').val(columns).prop('disabled', false).change();
                    }
                } else {
                    $('#bWrap').slideUp();
                }
            });

            $('#calculateMatrix').click(function() {
                var toDo = main.three.action,
                    A = main.three.parseMatrix($('#AMatrix')),
                    An = $('#nAVal').val(),
                    B = main.three.parseMatrix($('#BMatrix')),
                    Bn = $('#nBVal').val(),
                    result = [];
                A = methods.matrixOps.scalarMult(A, An);
                B = methods.matrixOps.scalarMult(B, Bn);
                switch (toDo) {
                    case 'ApB':
                        result = methods.matrixOps.addition(A, B, true);
                        break;
                    case 'AmB':
                        result = methods.matrixOps.addition(A, B, false);
                        break;
                    case 'AxB':
                        result = methods.matrixOps.multiplication(A, B, true);
                        break;
                }
                main.three.outputMatrix(result);
            });

            $("#nA").click(function() {
                var matrix = $('#AMatrix'),
                    n = $('#nAVal').val();
                matrix = main.three.parseMatrix(matrix);
                matrix = methods.matrixOps.scalarMult(matrix, n);
                main.three.outputMatrix(matrix);
            });

            $('#Trans').click(function() {
                var matrix = $('#AMatrix'),
                    n = $('#nAVal').val();
                matrix = main.three.parseMatrix(matrix);
                matrix = methods.matrixOps.scalarMult(matrix, n);
                matrix = methods.matrixOps.transpose(matrix, n);
                main.three.outputMatrix(matrix);
            });

            $('#Inv').click(function() {
                var matrix = $('#AMatrix'),
                    n = $('#nAVal').val(),
                    determinant;
                matrix = main.three.parseMatrix(matrix);
                matrix = methods.matrixOps.scalarMult(matrix, n);
                determinant = methods.matrixOps.determinant(matrix);
                if (determinant != 0) {
                    matrix = methods.matrixOps.invert(matrix);
                    main.three.outputMatrix(matrix);
                } else {
                    alertify.alert("La matriz no es invertible.");
                }
            });

            $('#Deter').click(function() {
                var matrix = $('#AMatrix'),
                    n = $('#nAVal').val();
                matrix = main.three.parseMatrix(matrix);
                matrix = methods.matrixOps.scalarMult(matrix, n);
                matrix = methods.matrixOps.determinant(matrix);
                main.three.outputScalar(matrix);
            });
        },

        /*
            Función que convierte las entradas del usuario en un arreglo bidimensional, recibe el nodo padre de los campos a extraer.
            Regresa un arreglo bidimensional.
        */
        parseMatrix: function(matrix) {
            var rows = matrix.find('.matrix-row');
            var parsedMatrix = [];
            rows.each(function() {
                var thisRow = [];
                $(this).find('.matrix-input').each(function() {
                    var toAdd = $(this).val();
                    if (isNaN(toAdd)) {
                        alertify.alert("Valores incorrectos en la matriz.");
                        return false;
                    } else {
                        if (toAdd === "") {
                            $(this).val(0);
                            toAdd = 0;
                        }

                        thisRow.push(parseFloat(toAdd));
                    }
                });
                parsedMatrix.push(thisRow);
            });
            return parsedMatrix;
        },

        /*
            Función que convierte un arreglo bidimensional en una matriz que se muestra de forma gráfica sobre campos de texto.
            Recibe una arreglo bidimensional.
        */
        outputMatrix: function(matrix) {
            if ($('#matrixOutput').length < 1)
                $('#matrixOutputWrap').html('<div id="matrixOutput" class="margin"><h3>Matriz resultante </h3>' +
                    '<div class="matrix-wrapper"><div class="matrix" id="OMatrix"></div></div></div>');
            var outputMatrix = $('#OMatrix'),
                columns = matrix[0].length,
                rows = matrix.length,
                baseInputHtml = '<div class="matrix-col"><input class="matrix-input" /></div>';
            outputMatrix.html('');
            outputMatrix.append('<div class="matrix-row">' + baseInputHtml + '</div>');
            outputMatrix.find('.matrix-col').append('<div class="row-label">1</div><div class="col-label">1</div>');
            while (outputMatrix.find('.matrix-row').length < rows) {
                var length = outputMatrix.find('.matrix-row').length + 1;
                outputMatrix.append('<div class="matrix-row"></div>');
                outputMatrix.find('.matrix-row').last().append(baseInputHtml).find('.matrix-col').append(
                    '<div class="row-label">' + length + '</div>');
                for (var i = 1; i < columns; i++) {
                    outputMatrix.find('.matrix-row').last().append(baseInputHtml);
                }
            }
            while (outputMatrix.find('.matrix-row').first().find('.matrix-col').length < columns) {
                var firstMatrix = outputMatrix.find('.matrix-row').first();
                firstMatrix.append(baseInputHtml);
                var i = firstMatrix.find('.matrix-col').length;
                firstMatrix.find('.matrix-col').last().append('<div class="col-label">' + i + '</div>');
            }

            var allRows = outputMatrix.find('.matrix-row');
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    allRows.eq(i).find('input').eq(j).val(matrix[i][j]);
                }
            }
            $('html, body').animate({
                scrollTop: outputMatrix.offset().top
            }, 1000);
        },

        /*
            Muestra un valor escalar en el área de resultados. Recibe el valor escalar a mostar.
        */
        outputScalar: function(scalar) {
            $('#matrixOutputWrap').html('<h3>Determinante:</h3>');
            $('#matrixOutputWrap').append('<h3>' + scalar + '</h3>')
        }

    },

    /*
        Objeto four - Contiene la lógica necesaria para la ejecución del punto cuatro de los requerimientos
    */
    four: {
        /*
            Inicializar campos y agregar listeners a los eventos
        */
        initInputs: function() {
            $('#four .matrix').find('.matrix-col').append('<div class="row-label">1</div><div class="col-label">a</div>');
            var baseInputHtml = '<div class="matrix-col"><input class="matrix-input" /></div>';
            var labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
            $('#LinealRow').change(function() {
                var rows = $('#LinealRow').val(),
                    columns = parseFloat(rows) + 1,
                    matrix = $('#LinealMatrix');
                while (matrix.find('.matrix-row').length < rows) {
                    var length = matrix.find('.matrix-row').length + 1;
                    matrix.append('<div class="matrix-row"></div>');
                    matrix.find('.matrix-row').last().append(baseInputHtml).find('.matrix-col').append(
                        '<div class="row-label">' + length + '</div>');
                    for (var i = 1; i < columns; i++) {
                        matrix.find('.matrix-row').last().append(baseInputHtml);
                    }
                }
                while (matrix.find('.matrix-row').length > rows) {
                    matrix.find('.matrix-row').last().remove();
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length < columns) {
                    var firstMatrix = matrix.find('.matrix-row').first();
                    matrix.find('.matrix-row').each(function() {
                        if ($(this).find('input').length < columns)
                            $(this).append(baseInputHtml);
                    });
                    var i = matrix.find('.matrix-row').first().find('.matrix-col').length;
                    matrix.find('.matrix-row').first().find('.matrix-col').last()
                        .append('<div class="col-label">' + labels[i++ - 1] + '</div>');
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length > columns) {
                    matrix.find('.matrix-row').each(function() {
                        $(this).find('.matrix-col').last().remove();
                    });
                }
            });

            $('#LinealRow').change();

            $('#doFour').click(function() {
                main.four.calculateSystem(1)
            });
        },

        /*
            Construye una matriz aumentada y la resuelve mediante el método de la matriz inversa.
            Recibe un entero que indica qué intento es, para funciones meramente informativas.
        */
        calculateSystem: function(attemptNo) {
            var augMatrix = $('#four .matrix'),
                A = [],
                B = [];
            augMatrix = main.three.parseMatrix(augMatrix);
            for (var i = 0; i < augMatrix.length; i++) {
                A.push([]);
                B.push([]);
                for (var j = 0; j < augMatrix[0].length - 1; j++) {
                    A[i][j] = augMatrix[i][j];
                }
                B[i][0] = augMatrix[i][augMatrix[0].length - 1];
            }
            var inconsistent = methods.matrixOps.checkForAugmentedInconsistencies(A, B);
            if (inconsistent) {
                alertify.alert("La matriz es inconsistente.");
            } else {

                var determinantA = methods.matrixOps.determinant(A)
                if (determinantA != 0) {
                    var InvertedA = methods.matrixOps.invert(A),
                        result = methods.matrixOps.multiplication(InvertedA, B);
                    main.four.output(result);
                } else {
                    main.four.output([], attemptNo);
                }
            }
        },

        /*
            Arreglo que almacena las variables que el usuario ha fijado.
        */
        fixedVars: [],

        /*
            Muestra el resultado del método, o pide al usuario fijar un valor en caso de que no se encuentre una solución única.
            Recibe un arreglo bidimensional y un entero que representa el número de intentos.
        */
        output: function(matrix, failedAttempt) {
            $('#four .results').slideDown();
            if (failedAttempt) {
                var eqSize = $('#LinealRow').val(),
                    labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
                $('#fourOutput').html('<h2>El sistema no tiene una solución única. (' + failedAttempt + ')</h2>');
                $('#fourOutput').append('<h2>Es necesario fijar valores.</h2>');
                $('#fourOutput').append(labels[eqSize - 1] + ' = <input id="fixedA" class="matrix-input">');
                $('#fourOutput').append('<button id="recalcA" class="btn btn-danger">Calcular</button>');
                $('#recalcA').one('click', function() {
                    var fixedVal = parseFloat($('#fixedA').val()),
                        newSize = $('#LinealRow').val() - 1;
                    for (var i = 0; i < newSize; i++) {
                        var xField = $('#LinealMatrix .matrix-row').eq(i).find('.matrix-col input').eq(eqSize - 1),
                            lastField = $('#LinealMatrix .matrix-row').eq(i).find('.matrix-col input').last();
                        xField.val(parseFloat(lastField.val()) - xField.val() * fixedVal);
                    }
                    $('#LinealRow').val(newSize).change();
                    main.four.fixedVars.push(labels[eqSize - 1] + ' = ' + fixedVal);
                    main.four.calculateSystem(failedAttempt + 1);
                });
            } else {
                $('#fourOutput').html('<h2>Resultados:</h2>');
                var labels = ['a', 'b', 'c', 'd', 'e', 'f'];
                for (var i = 0; i < matrix.length; i++) {
                    var html = '<p>';
                    html += labels[i] + ' = ' + matrix[i][0].toFixed(6) + '</p>';
                    $('#fourOutput').append(html);
                }
                for (var i = 0; i < main.four.fixedVars.length; i++) {
                    var html = '<p>';
                    html += main.four.fixedVars[i] + '</p>';
                    $('#fourOutput').append(html);
                }
                main.four.fixedVars = [];
            }
        }
    },

    /*
        Función five - Contiene la lógica necesaria para la ejecución del punto cinco de los requerimientos.
    */
    five: function() {
        var eq1 = $('#fiveOne').val(),
            eq2 = $('#fiveTwo').val(),
            x = $('#fiveX').val(),
            y = helpers.eval(eq1, x);
        if (!(helpers.isValidInput(eq1, x) && helpers.isValidInput(eq2, x))) {
            alertify.alert("Ecuación inválida.");
            return false;
        }
        try {
            var result = parseFloat(methods.newtonMultivariable(eq1, eq2, x, y).toFixed(6)),
                point = "(" + result + ", " + parseFloat(helpers.eval(eq1, result).toFixed(6)) + ")";
        } catch (e) {
            alertify.alert('El método diverge.');
            return false;
        }
        var chartData = helpers.getChartData(eq1, 3, result, eq2);
        $('#five .results').slideDown();
        new Chartist.Line('#fiveChart', chartData, main.chartOptions);
        $('#fiveOutput').html('<h3 style="text-align: center;">Las ecuaciones se intersectan en el punto ' + point + '</h3>')
        $('html, body').animate({
            scrollTop: $('#fiveOutput').offset().top
        }, 300);
    },

    /*
        Objeto Six - Contiene la lógica necesaria para la ejecución del punto seis de los requerimientos
    */
    six: {
        /*
            Inicializar campos y asignar listeners a los eventos.
        */
        init: function() {
            $('#six .matrix').find('.matrix-col').append('<div class="row-label">1</div><div class="col-label">x</div>');
            var baseInputHtml = '<div class="matrix-col"><input class="matrix-input" /></div>';
            var labels = ['x', 'y'];
            $('#fitRow').change(function() {
                var rows = $('#fitRow').val(),
                    columns = 2,
                    matrix = $('#fitMatrix');
                while (matrix.find('.matrix-row').length < rows) {
                    var length = matrix.find('.matrix-row').length + 1;
                    matrix.append('<div class="matrix-row"></div>');
                    matrix.find('.matrix-row').last().append(baseInputHtml).find('.matrix-col').append(
                        '<div class="row-label">' + length + '</div>');
                    for (var i = 1; i < columns; i++) {
                        matrix.find('.matrix-row').last().append(baseInputHtml);
                    }
                }
                while (matrix.find('.matrix-row').length > rows) {
                    matrix.find('.matrix-row').last().remove();
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length < columns) {
                    var firstMatrix = matrix.find('.matrix-row').first();
                    matrix.find('.matrix-row').each(function() {
                        if ($(this).find('input').length < columns)
                            $(this).append(baseInputHtml);
                    });
                    var i = matrix.find('.matrix-row').first().find('.matrix-col').length;
                    matrix.find('.matrix-row').first().find('.matrix-col').last()
                        .append('<div class="col-label">' + labels[i++ - 1] + '</div>');
                }
                while (matrix.find('.matrix-row').first().find('.matrix-col').length > columns) {
                    matrix.find('.matrix-row').each(function() {
                        $(this).find('.matrix-col').last().remove();
                    });
                }

                $('#fitGrade').html('');
                for (var i = 1; i < rows; i++) {
                    var option = "<option value='" + i + "'>" + i + "</option>";
                    $('#fitGrade').append(option);
                }

            });

            $('#fitRow').change();

            $('#doSix').click(function() {
                var xyPairs = main.six.buildPairsMatrix(),
                    grade = parseFloat($('#fitGrade').val()),
                    AMatrix = [],
                    BMatrix = [];
                for (var i = 0; i < xyPairs.length; i++) {
                    AMatrix.push([]);
                    BMatrix.push([xyPairs[i][1]]);
                    for (var j = 0; j < grade + 1; j++) {
                        if (j == 0) {
                            AMatrix[i].push(1);
                        } else {
                            AMatrix[i].push(Math.pow(xyPairs[i][0], j));
                        }
                    }
                }
                var Atrans = methods.matrixOps.transpose(AMatrix),
                    Amod = methods.matrixOps.multiplication(Atrans, AMatrix),
                    Bmod = methods.matrixOps.multiplication(Atrans, BMatrix),
                    inverseAmod = methods.matrixOps.invert(Amod),
                    coefficients = methods.matrixOps.multiplication(inverseAmod, Bmod),
                    equation = main.six.buildEquation(coefficients, false),
                    chartData = helpers.getChartData(equation, grade, xyPairs[parseInt(xyPairs.length / 2)][0]),
                    rsq = main.six.getRSQ(xyPairs, equation);

                $('#six .results').slideDown();
                new Chartist.Line('#sixChart', chartData, main.chartOptions);
                $('#sixOutput').html('').append("<h3>f(x) = " + main.six.buildEquation(coefficients, true) + "</h3>")
                    .append("<h3>r<span class='exponent'>2</span> = " + parseFloat(rsq.toFixed(6)));
                $('html, body').animate({
                    scrollTop: $('#sixOutput').offset().top
                }, 300);
            });
        },

        /*
            Calcula el valor r cuadarada de un ajuste de curvas. Recibe un arreglo bidimensional de pares x,y y una cadena con una ecuación.
            Regresa un flotante. 
        */
        getRSQ: function(xyPairs, equation) {
            var sum = 0,
                yiym = 0,
                yipx = 0;
            for (var i = 0; i < xyPairs.length; i++) {
                sum += xyPairs[i][1];
            }
            var averageY = sum / xyPairs.length;
            for (var i = 0; i < xyPairs.length; i++) {
                yiym += Math.pow(xyPairs[i][1] - averageY, 2);
                yipx += Math.pow(xyPairs[i][1] - helpers.eval(equation, xyPairs[i][0]), 2);
            }
            return (yiym - yipx) / yiym;
        },

        /*
            Convierte un arreglo de coeficientes en una cadena en lenguaje natural. 
            Recibe un arreglo bidimensional de tamaño N,1 y un booleano que indica si los exponentes han de ser agregados con estilo.
            Regresa una cadena.
        */
        buildEquation: function(coefficients, prettyExponents) {
            var txt = "";
            for (var i = coefficients.length - 1; i >= 0; i--) {
                var thisCoef = parseFloat(coefficients[i][0].toFixed(6));
                if (i > 0 && thisCoef == 1) thisCoef = "";
                if (thisCoef !== 0) {
                    txt += (thisCoef > 0 && txt.length > 0) ? " + " + thisCoef :
                        (txt.length > 0) ? " - " + Math.abs(thisCoef) : thisCoef;
                    if (i > 1) txt += prettyExponents ? "x<span class='exponent'>" + i + "</span>" : "x^" + i;
                    else if (i == 1) txt += "x";
                }
            }
            return txt;
        },

        /*
            Extrae los x,y valores de los campos y los introduce en una arreglo bidimensional.
            Regrsa un arreglo bidimensional de tamaño N,2
        */
        buildPairsMatrix: function() {
            var values = [],
                xVals = [],
                n = $('#fitRow').val();
            for (var i = 0; i < n; i++) {
                var fields = $('#fitMatrix .matrix-row').eq(i).find('input'),
                    x = parseFloat(fields.eq(0).val()),
                    y = parseFloat(fields.eq(1).val());
                if (isNaN(x)) {
                    x = 0;
                    fields.eq(0).val("0");
                }
                if (isNaN(y)) {
                    y = 0;
                    fields.eq(1).val("0");
                }
                if (xVals.indexOf(x) == -1) {
                    xVals.push(x);
                    values.push([x, y]);
                } else {
                    alertify.alert("Se han introducido valores duplicados de x.");
                    throw 'Los puntos introducidos no corresponden a una función.';
                }
            }
            return values;
        }
    }

}