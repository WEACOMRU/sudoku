var Sudoku = (function () {
    'use strict';

    var
        defaults = {
            css: {
                target: 'sudoku',
                segment: 'sudoku_segment',
                cell: 'sudoku_cell'
            },
            size: 3
        },

        $ = (function () {
            var $$ = window.jQuery || window.Zepto || window.Dom7;

            if ($$) {
                return $$;
            } else {
                throw 'jQuery-compatible library needed';
            }
        })(),

        checkSetting = function (settings) {
            if (!settings.method) {
                settings.method = settings.size > 3 ? 'lite' : 'hard';
            }

            return settings;
        },

        arrayUtils = {
            shuffle: function (array) {
                return array.sort(function () {
                    return .5 - Math.random();
                });
            },

            swapRows: function (array, i, j) {
                var buffer,
                    k;

                if (i !== j) {
                    for (k = 0; k < array[i].length; k++) {
                        buffer = array[i][k];
                        array[i][k] = array[j][k];
                        array[j][k] = buffer;
                    }
                }

                return array;
            },

            swapCols: function (array, i, j) {
                var buffer,
                    k;

                if (i !== j) {
                    for (k = 0; k < array.length; k++) {
                        buffer = array[k][i];
                        array[k][i] = array[k][j];
                        array[k][j] = buffer;
                    }
                }

                return array;
            },

            swapSegmentRows: function (array, i, j, size) {
                var k;

                if (i !== j) {
                    for (k = 0; k < size; k++) {
                        arrayUtils.swapRows(array, i * size + k, j * size + k);
                    }
                }

                return array;
            },

            swapSegmentCols: function (array, i, j, size) {
                var k;

                if (i !== j) {
                    for (k = 0; k < size; k++) {
                        arrayUtils.swapCols(array, i * size + k, j * size + k);
                    }
                }

                return array;
            },

            transpose: function (array) {
                var buffer,
                    i, j;

                for (i = 0; i < array.length; i++) {
                    for (j = i + 1; j < array.length; j++) {
                        buffer = array[i][j];
                        array[i][j] = array[j][i];
                        array[j][i] = buffer;
                    }
                }

                return array;
            }
        },

        generateMap = {
            lite: function ($target, settings) {
                var gameMap = [[]],
                    candidates,
                    halfSize = Math.floor(settings.size / 2),
                    i, j,
                    iRand, jRand,

                    generateCandidates = function (settings) {
                        var candidates = [],
                            segmentLength = Math.pow(settings.size, 2),
                            i;

                        for (i = 0; i < segmentLength; i++) {
                            candidates[i] = i + 1;
                        }

                        return arrayUtils.shuffle(candidates);
                    },

                    checkCol = function (gameMap, col, value) {
                        var valid = true,
                            i;

                        for (i = 0; i < gameMap.length && valid; i++) {
                            if (gameMap[i][col] === value) {
                                valid = false;
                            }
                        }

                        return valid;
                    },

                    generateValidRow = function (settings, gameMap, row) {
                        var candidates = generateCandidates(settings),
                            segmentLength = Math.pow(settings.size, 2),
                            i, j;

                        gameMap[row] = [];
                        for (i = 0; i < segmentLength; i++) {
                            for (j = 0; j < candidates.length && !gameMap[row][i]; j++) {
                                if (checkCol(gameMap, i, candidates[j])) {
                                    gameMap[row][i] = candidates[j];
                                    candidates.splice(j, 1);
                                }
                            }
                            /* Перезапуск генерации строки */
                            if (!gameMap[row][i]) {
                                generateValidRow(settings, gameMap, row);
                            }
                        }
                    },

                    generatePair = function (settings, value, mode) {
                        var pair = NaN,

                            methods = {
                                segment: function (settings, value) {
                                    var segment = Math.floor(value / settings.size);
                                    return segment * settings.size + Math.floor(Math.random() * settings.size);
                                },

                                map: function (settings, value) {
                                    return Math.floor(Math.random() * settings.size) * settings.size + value % settings.size;
                                }
                            };

                        if (methods[mode]) {
                            pair = methods[mode](settings, value);
                        }
                        if (pair === value) {
                            pair = generatePair(settings, value, mode);
                        }

                        return pair;
                    },

                    fillMap = function ($target, settings, gameMap) {
                        var $segmentSet = $('.' + settings.css.segment, $target),
                            $cellSet,
                            i, j, iMap, jMap;

                        for (i = 0; i < settings.size * settings.size; i++) {
                            $cellSet = $('.' + settings.css.cell, $segmentSet.eq(i));
                            for (j = 0; j < settings.size * settings.size; j++) {
                                iMap = Math.floor(i / settings.size) * settings.size + Math.floor(j / settings.size);
                                jMap = (i % settings.size) * settings.size + j % settings.size;
                                if (gameMap[iMap][jMap]) {
                                    $cellSet.eq(j)
                                        .text(gameMap[iMap][jMap])
                                        .addClass('__disabled');
                                }
                            }
                        }
                    };

                /* Заполнение первой строки массива */
                gameMap[0] = generateCandidates(settings);

                /* Заполнение оставшихся строк массива */
                for (i = 0; i < Math.pow(settings.size, 2); i += settings.size) {
                    if (i > 0) {
                        generateValidRow(settings, gameMap, i);
                    }

                    for (j = 1; j < settings.size; j++) {
                        gameMap[i + j] = gameMap[i].slice(j * settings.size).concat(gameMap[i].slice(0, j * settings.size));
                    }
                }

                /* Перемешивание матрицы */
                for (i = 0; i < settings.size; i++) {
                    /* Мы можем глобально менять столбцы, находящиеся на одинаковой
                       позиции в сегментах, так как при нашей генерации они содержат
                       одинаковый набор значений */
                    iRand = Math.floor(Math.random() * i * settings.size);
                    jRand = generatePair(settings, iRand, 'map');
                    arrayUtils.swapCols(gameMap, iRand, jRand);
                }

                for (i = 0; i < settings.size; i++) {
                    /* Для каждого сегмента выполним несколько манипуляций
                       со строками и стобцами в кол-ве равном половине стороны сегмента */
                    for (j = 0; j < halfSize; j++) {
                        /* В пределах каждого сегмента мы можем менять между собой любые
                           строки и столбцы */
                        iRand = i * settings.size + Math.floor(Math.random() * settings.size);
                        jRand = generatePair(settings, iRand, 'segment');
                        arrayUtils.swapCols(gameMap, iRand, jRand);
                        arrayUtils.swapRows(gameMap, iRand, jRand);
                    }
                }

                fillMap($target, settings, gameMap);
            },

            hard: function ($target, settings) {
                var gameMap = [],

                    generateCandidates = function (settings, gameMap, cell) {
                        var segmentLength = Math.pow(settings.size, 2),
                            candidates = [],
                            i, j;

                        for (i = 0; i < segmentLength; i++) {
                            candidates.push(i + 1);
                        }

                        for (i = cell - cell % segmentLength; i < cell; i++) {
                            for (j = 0; j < candidates.length; j++) {
                                if (gameMap[i].value === candidates[j]) {
                                    candidates.splice(j, 1);
                                    j = candidates.length;
                                }
                            }
                        }

                        return arrayUtils.shuffle(candidates);
                    },

                    checkSell = function (settings, gameMap, cell) {
                        var segmentLength = Math.pow(settings.size, 2),
                            startSegment,
                            startSegmentCell,
                            valid = true,
                            i, j, k;

                        /* Обход строк */
                        startSegment = Math.floor(Math.floor(cell / segmentLength) / settings.size) * settings.size;
                        startSegmentCell = Math.floor(cell % segmentLength / settings.size) * settings.size;
                        k = 0;

                        for (i = 0; i < settings.size && k < cell && valid; i++) {
                            for (j = 0; j < settings.size && k < cell && valid; j++) {
                                k = (startSegment + i) * segmentLength + startSegmentCell + j;

                                if (k < cell && gameMap[k].value === gameMap[cell].value) {
                                    valid = false;
                                }
                            }
                        }

                        /* Обход столбцов */
                        startSegment = Math.floor(cell / segmentLength) % settings.size;
                        startSegmentCell = cell % settings.size;
                        k = 0;

                        for (i = 0; i < settings.size && k < cell && valid; i++) {
                            for (j = 0; j < settings.size && k < cell && valid; j++) {
                                k = (startSegment + settings.size * i) * segmentLength + startSegmentCell + settings.size * j;

                                if (k < cell && gameMap[k].value === gameMap[cell].value) {
                                    valid = false;
                                }
                            }
                        }

                        return valid;
                    },

                    setCell = function (settings, gameMap, cell) {
                        var valid = false;

                        gameMap[cell] = gameMap[cell] || {};

                        if (typeof gameMap[cell].candidates === 'undefined' || gameMap[cell].candidates === null) {
                            gameMap[cell].candidates = generateCandidates(settings, gameMap, cell);
                        }

                        while (gameMap[cell].candidates.length && !valid) {
                            gameMap[cell].value = gameMap[cell].candidates.shift();
                            valid = checkSell(settings, gameMap, cell);
                        }

                        if (!valid) {
                            gameMap[cell] = {};
                        }

                        return valid;
                    },

                    generate = function (settings, gameMap, cell) {
                        if (cell < 0) {
                            return false;
                        }

                        if (cell === Math.pow(settings.size, 4)) {
                            return true;
                        }

                        if (setCell(settings, gameMap, cell)) {
                            generate(settings, gameMap, cell + 1);
                        } else {
                            generate(settings, gameMap, cell - 1)
                        }
                    },

                    fillMap = function ($target, settings, gameMap) {
                        var segmentLength = Math.pow(settings.size, 2);

                        $('.' + settings.css.segment, $target).each(function (segment) {
                            var $segment = $(this);
                            $('.' + settings.css.cell, $segment).each(function (segmentCell) {
                                var $cell = $(this),
                                    cell = segment * segmentLength + segmentCell;

                                if (gameMap[cell].value) {
                                    $cell
                                        .text(gameMap[cell].value)
                                        .addClass('__disabled');
                                }
                            });
                        });
                    };

                generate(settings, gameMap, 0);

                fillMap($target, settings, gameMap);
            }
        },

        createElements = function ($target, settings) {
            var $segment,
                $cell,
                percentSize,
                fontSize,
                i, j;

            $target.addClass(settings.css.target);

            percentSize = 100 / settings.size;
            fontSize = .3 + Math.exp(-settings.size) * 50;

            for (i = 0; i < settings.size * settings.size; i++) {
                $segment = $('<div/>');

                for (j = 0; j < settings.size * settings.size; j++) {
                    $cell = $('<div/>');
                    $cell
                        .css({
                            width: percentSize + '%',
                            height: percentSize + '%',
                            fontSize: fontSize + 'em'
                        })
                        .addClass(settings.css.cell);
                    $segment.append($cell);
                }

                $segment
                    .css({
                        width: percentSize + '%',
                        height: percentSize + '%'
                    })
                    .addClass(settings.css.segment);
                $target.append($segment);
            }
        },

        init = function (options) {
            var settings,
                $target;

            settings = checkSetting($.extend(true, {}, defaults, options));

            $target = $(settings.target);

            createElements($target, settings);
            generateMap[settings.method]($target, settings);
        };

    return {
        defaults: defaults,
        init: init
    }
})();
