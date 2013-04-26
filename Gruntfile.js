module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: ['app/src/**/*.js'],
                dest: 'app/dist/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            sentToExample: {
                src: ['app/src/**/*.js'],
                dest: 'sample-ui/vendor/scripts/<%= pkg.name %>.js'
            }
        },

        uglify: {
            distMin: {
                options: {
                    report: 'gzip'
                },
                files: {
                    'app/dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['app/dist/<%= pkg.name %>-<%= pkg.version %>.js']
                }
            }
        },

        umd: {
            all: {
                src: 'app/dist/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'app/dist/<%= pkg.name %>-<%= pkg.version %>.umd.js',
                objectToExport: 'library'
            }
        },

        jshint: {
            all: ['app/src/**/*.js']
        },

        mocha: {
            tests: {
                src: ['test/test.html'],
                options: {
                    reporter: 'Nyan',
                    growl: true,
                    run: true
                }
            }
        },

        watch: {
            files: 'app/src/**/*.js',
            tasks: ['jshint', 'mocha']
        }
    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-umd');

    grunt.registerTask('dist', ['concat', 'uglify', 'umd']);
    grunt.registerTask('test', ['jshint', 'mocha']);
};