module.exports = (grunt)->
  grunt.initConfig
    coffee: compile: files: 'dist/charm.js': 'src/charm.coffee'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.registerTask('default', ['coffee'])