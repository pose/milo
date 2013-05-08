module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            src: ['app/src/namespace.js',
                'app/src/core/options.js',
                'app/src/dsl/uriTemplates.js',
                'app/src/dsl/property.js',
                'app/src/core/deferred.js',
                'app/src/core/proxy.js',
                'app/src/core/arrayProxy.js',
                'app/src/adapters/defaultAdapter.js',
                'app/src/adapters/defaultSerializer.js',
                'app/src/core/queryable.js',
                'app/src/model.js',
                'app/src/core/api.js']
        },

        clean: ['website/stylesheets', 'website/api', 'app/dist', 'sample-ui/vendor/scripts/<%= pkg.name %>.js'],

        concat: {
            dist: {
                src: '<%= dirs.src %>',
                dest: 'app/dist/<%= pkg.name %>.js'
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
                    'app/dist/<%= pkg.name %>.min.js': '<%= dirs.src %>'
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
                    paths: 'app/src',
                    outdir: 'website/api'
                }
            }
        },

        jshint: {
            all: ['app/src/**/*.js']
        },

        mocha_phantomjs: {
            all: ['test/**/*.html']
        },

        watch: {
          javascript: {
            files: ['app/src/**/*.js', 'test/*.js'],
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

    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
    grunt.registerTask('test', ['clean', 'jshint', 'concat', 'mocha_phantomjs']);
    grunt.registerTask('doc', ['clean', 'less', 'yuidoc']);
    grunt.registerTask('ci', ['test', 'dist', 'doc']);
};
