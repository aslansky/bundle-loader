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
    complexity: {
      generic: {
        src: ['index.js'],
        options: {
          errorsOnly: false,
          cyclomatic: 4,
          halstead: 9,
          maintainability: 80
        }
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
        files: ['*.js', 'test/*.js'],
        tasks: ['jshint:test', 'complexity'],
        options: {
          nospawn: true
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          keepalive: true,
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['concat:build','uglify:build']);
};
