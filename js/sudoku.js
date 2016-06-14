var Sudoku = (function () {
    'use strict';

    var
        defaults = {
            css: {
                target: 'sudoku',
                block: 'sudoku_block',
                cell: 'sudoku_cell'
            },
            size: 3
        },

        fillMap = function ($target, settings, gameMap) {
            var $blockSet = $('.' + settings.css.block, $target),
                $cellSet,
                i, j, iMap, jMap;

            /* Расстановка элементов */
            for (i = 0; i < settings.size * settings.size; i++) {
                $cellSet = $('.' + settings.css.cell, $blockSet.eq(i));
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
        },

        shuffle = function (array) {
            array.sort(function () {
                return .5 - Math.random();
            });
        },

        swapRows = function (array, i, j) {
            var buffer,
                k;

            if (i !== j) {
                for (k = 0; k < array[i].length; k++) {
                    buffer = array[i][k];
                    array[i][k] = array[j][k];
                    array[j][k] = buffer;
                }
            }
        },

        swapCols = function (array, i, j) {
            var buffer,
                k;

            if (i !== j) {
                for (k = 0; k < array[i].length; k++) {
                    buffer = array[k][i];
                    array[k][i] = array[k][j];
                    array[k][j] = buffer;
                }
            }
        },

        swapBlockRows = function (array, i, j, size) {
            var k;

            if (i !== j) {
                for (k = 0; k < size; k++) {
                    swapRows(array, i * size + k, j * size + k);
                }
            }
        },

        swapBlockCols = function (array, i, j, size) {
            var k;

            if (i !== j) {
                for (k = 0; k < size; k++) {
                    swapCols(array, i * size + k, j * size + k);
                }
            }
        },

        transpose = function (array) {
            var buffer,
                i, j;

            for (i = 0; i < array.length; i++) {
                for (j = i + 1; j < array.length; j++) {
                    buffer = array[i][j];
                    array[i][j] = array[j][i];
                    array[j][i] = buffer;
                }
            }
        },

        generate = function ($target, settings) {
            var gameMap = [[]],
                halfSize = settings.size / 2,
                i, j,
                iRand, jRand;

            /* Заполнение первой строки массива */
            for (i = 0; i < settings.size * settings.size; i++) {
                gameMap[0][i] = i + 1;
            }

            /* Перемешивание первой строки массива */
            shuffle(gameMap[0]);

            /* Заполнение оставшихся строк массива */
            for (i = 0; i < settings.size * settings.size; i += settings.size) {
                if (i > 0) {
                    j = Math.round(i / settings.size);
                    gameMap[i] = gameMap[0].slice(-j).concat(gameMap[0].slice(0, -j));
                }

                for (j = 1; j < settings.size; j++) {
                    gameMap[i + j] = gameMap[i].slice(j * settings.size).concat(gameMap[i].slice(0, j * settings.size));
                }
            }

            /* Перемешивание всего массива */
            for (i = 0; i < settings.size; i++) {
                iRand = i * settings.size + Math.floor(Math.random() * halfSize);
                jRand = i * settings.size + Math.floor(halfSize + Math. random() * halfSize);
                swapCols(gameMap, iRand, jRand);
                swapRows(gameMap, iRand, jRand);
            }

            transpose(gameMap);

            iRand = Math.floor(Math.random() * halfSize);
            jRand = Math.floor(halfSize + Math. random() * halfSize);
            swapBlockCols(gameMap, iRand, jRand, settings.size);
            swapBlockRows(gameMap, iRand, jRand, settings.size);

            fillMap($target, settings, gameMap);
        },

        generateCandidates = function (settings, gameMap, cell) {
            var segmentSize = Math.pow(settings.size, 2),
                candidates = [],
                i;

            for (i = 0; i < segmentSize; i++) {
                candidates = i + 1;
            }

            //for (i = cell - cell % segmentSize; i < cell; i++) {
            //
            //}
        },

        setCell = function (settings, gameMap, cell) {
            gameMap[cell] = gameMap[cell] || {};

            if (typeof gameMap[cell].candidates === 'undefined') {
                gameMap[cell].candidates = generateCandidates(settings, gameMap, cell);
            }
        },

        generateMap = function (settings, gameMap, cell) {
            if (cell < 0) {
                return false;
            }

            if (cell > Math.pow(settings.size, 4)) {
                return true;
            }

            if (setCell(settings, gameMap, cell)) {
                generateMap(settings, gameMap, cell + 1);
            } else {

            }
        },

        generate2 = function ($target, settings) {
            var gameMap = {},
                i;


        },

        createElements = function ($target, settings) {
            var $ = window.jQuery || window.Zepto || window.Dom7,
                $block,
                $cell,
                percentSize,
                fontSize,
                i, j;

            $target.addClass(settings.css.target);

            percentSize = 100 / settings.size;
            fontSize = .3 + Math.exp(-settings.size) * 50;

            for (i = 0; i < settings.size * settings.size; i++) {
                $block = $('<div/>');

                for (j = 0; j < settings.size * settings.size; j++) {
                    $cell = $('<div/>');
                    $cell
                        .css({
                            width: percentSize + '%',
                            height: percentSize + '%',
                            fontSize: fontSize + 'em'
                        })
                        .addClass(settings.css.cell);
                    $block.append($cell);
                }

                $block
                    .css({
                        width: percentSize + '%',
                        height: percentSize + '%'
                    })
                    .addClass(settings.css.block);
                $target.append($block);
            }
        },

        init = function (options) {
            var $ = window.jQuery || window.Zepto || window.Dom7,
                settings,
                $target;

            if (!$) {
                /* TODO throw */
                console.error('jQuery-compatible library needed');
                return false;
            }

            settings = $.extend(true, {}, defaults, options);

            $target = $(settings.target);

            createElements($target, settings);
            generate($target, settings);
        };

    return {
        defaults: defaults,
        init: init
    }
})();
