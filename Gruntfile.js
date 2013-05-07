module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      build: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
          'bundle-loader.js': ['lib/*.js']
        }
      }
    },
    uglify: {
      build: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        files: {
          'bundle-loader.min.js': ['lib/*.js']
        }
      }
    },
    karma: {
      options: {
        configFile: 'test/karma.config.js'
      },
      watch: {
        browsers: ['Chrome', 'Firefox'],
        background: true
      },
      test: {
        browsers: ['Chrome', 'Firefox'],
        singleRun: true
      },
      report: {
        reporters: 'coverage',
        coverageReporter: {
          type : 'html',
          dir : 'report/coverage/'
        },
        preprocessors: {
          'lib/*.js': 'coverage'
        },
        browsers: ['Chrome'],
        singleRun: true
      }
    },
    jshint: {
      test: ['Gruntfile.js', 'lib/*.js']
    },
    clean: {
      build: ['javascript/build/*.js']
    },
    watch: {
      scripts: {
        files: ['lib/*.js', 'test/spec/*.js'],
        tasks: ['jshint:test', 'karma:watch:run'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['karma:watch', 'watch']);
  grunt.registerTask('test', ['jshint:test', 'karma:test']);
  grunt.registerTask('report', ['karma:report']);
  grunt.registerTask('build', ['concat:build','uglify:build']);
};
