module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # CoffeeScript compilation
    coffee:
      spec:
        options:
          bare: true
        expand: true
        cwd: 'spec'
        src: ['**.coffee']
        dest: 'spec'
        ext: '.js'

    # Browser version building
    exec:
      nuke_main:
        command: 'rm -rf ./components/*/'
      nuke_preview:
        command: 'rm -rf ./components/*/'
        cwd: 'preview'
      main_install:
        command: './node_modules/.bin/component install'
      main_build:
        command: './node_modules/.bin/component build -u component-json,component-coffee -o browser -n oflo-ide -c'

    # Automated recompilation and testing when developing
    watch:
      files: [
        'src/*.coffee'
        'src/**/*.coffee'
        'components/*.coffee'
        'graphs/*.json'
        'component.json'
        'spec/*.coffee'
      ]
      tasks: ['build']
      
  # Grunt plugins used for building
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-exec'
  @loadNpmTasks 'grunt-contrib-uglify'

  # Grunt plugins used for testing
  @loadNpmTasks 'grunt-contrib-watch'
  @loadNpmTasks 'grunt-mocha-phantomjs'
  @loadNpmTasks 'grunt-coffeelint'

  # Our local tasks
  @registerTask 'nuke', ['exec:nuke_main', 'exec:nuke_preview']
  @registerTask 'build', ['exec:main_install', 'exec:main_build']
  @registerTask 'default', ['build']
