module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= pkg.license %> */\n',
        // Task configuration
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/css-transition-lib.js'],
                dest: 'dist/css-transition-lib.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/css-transition-lib.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        qunit: {
            options: {
                coverage: {
                    src: ['lib/**/*.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'reports/coverage/',
                    coberturaReport: 'reports/coverage/',
                    lcovReport: 'reports/coverage',
                    linesThresholdPct: 85
                }
            },
            files: ['test/**/*.html']
        },
        qunit_junit: {
            options: {
                dest: 'reports/tests/'
            }
        },
        coveralls: {
            coverage: {
                src: 'reports/coverage/lcov.info',
                options: {
                    force: true
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-coveralls');

    // Default task
    grunt.registerTask('test', ['jshint', 'qunit_junit', 'qunit']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('default', ['test', 'build']);
};
