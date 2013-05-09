module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            src: ['src/namespace.js',
                'src/core/options.js',
                'src/dsl/uriTemplates.js',
                'src/dsl/property.js',
                'src/core/deferred.js',
                'src/core/proxy.js',
                'src/core/arrayProxy.js',
                'src/adapters/defaultAdapter.js',
                'src/adapters/defaultSerializer.js',
                'src/core/queryable.js',
                'src/model.js',
                'src/core/api.js']
        },

        clean: ['website/stylesheets', 'website/api', 'dist', 'sample-ui/vendor/scripts/<%= pkg.name %>.js'],

        concat: {
            dist: {
                src: '<%= dirs.src %>',
                dest: 'dist/<%= pkg.name %>.js'
            },
            sentToExample: {
                src: '<%= dirs.src %>',
                dest: 'sample-ui/vendor/scripts/<%= pkg.name %>.js'
            }
        },

        uglify: {
            distMin: {
                options: {
                    report: 'gzip'
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': '<%= dirs.src %>'
                }
            }
        },

        less: {
            development: {
                options: {
                    paths: ['website/less']
                },
                files: {
                    "website/stylesheets/milo.css": "website/less/milo.less"
                }
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                version: '<%= pkg.version %>',
                options: {
                    paths: 'src',
                    outdir: 'website/api'
                }
            }
        },

        jshint: {
            all: ['src/**/*.js']
        },

        mocha_phantomjs: {
            all: ['test/**/*.html']
        },

        zip: {
            dist: {
                src: ['dist/<%= pkg.name %>.min.js'],
                dest: 'dist/<%= pkg.name %> - <%= pkg.version %>.zip'
            }
        },

        watch: {
            javascript: {
                files: ['src/**/*.js', 'test/*.js'],
                tasks: ['concat', 'jshint', 'mocha_phantomjs']
            },
            stylesheets: {
                files: ['website/less/*.less'],
                tasks: ['less']
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('dist', ['clean', 'concat', 'uglify', 'zip']);
    grunt.registerTask('test', ['clean', 'jshint', 'concat', 'mocha_phantomjs']);
    grunt.registerTask('doc', ['clean', 'less', 'yuidoc']);
    grunt.registerTask('ci', ['test', 'dist', 'doc']);
};