
var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , path = require('path')
  , _ = require('underscore')
	, JRSResume = require('../src/core/jrs-resume')
  , validator = require('is-my-json-valid');

chai.config.includeStack = false;

function testResume( opts ) {

  describe( opts.title + ' (JRS)', function() {

    opts.isValid = opts.isValid !== false;

    var _sheet;

    it('should open without throwing an exception', function () {
      var that = this;
      function tryOpen() {
        _sheet = new JRSResume().open(
          path.join( __dirname, 'resumes/jrs-0.0.0/' + opts.title + '.json' ) );
      }
      tryOpen.should.not.Throw();
    });

    it('should have one or more of each section', function() {
      var newObj = _.pick( _sheet, opts.sections );
      expect( Object.keys(newObj).length ).to.equal( opts.sections.length );
    });

    it('should have a work duration of ' + opts.duration + ' years', function() {
      _sheet.basics.computed.numYears.should.equal( opts.duration );
    });

    it('should save without throwing an exception', function() {
      var that = this;
      function trySave() {
        _sheet.save( 'tests/sandbox/' + opts.title + '.json' );
      }
      trySave.should.not.Throw();
    });

    it('should not be modified after saving', function() {
      var savedSheet = new JRSResume().open( 'tests/sandbox/' + opts.title + '.json' );
      _sheet.stringify().should.equal( savedSheet.stringify() )
    });

    it('should ' + (opts.isValid ? '' : 'NOT ') + 'validate against the JSON Resume schema', function() {
      var result = _sheet.isValid();
      // var schemaJson = require('../src/core/resume.json');
      // var validate = validator( schemaJson, { verbose: true } );
      // var result = validate( JSON.parse( _sheet.imp.raw ) );
      result || console.log("\n\nOops, resume didn't validate. " +
       "Validation errors:\n\n", _sheet.basics.imp.validationErrors, "\n\n");
      result.should.equal( opts.isValid );
    });

  });
}

var sects = [ 'basics', 'work', 'volunteer', 'skills', 'education', 'publications', 'awards', 'references' ];

testResume({ title: 'jane-q-fullstacker', duration: 7, sections: sects });
testResume({ title: 'jane-incomplete', duration: 0, sections: _.without(sects, 'awards', 'work') });
testResume({ title: 'richard-hendriks', duration: 1, sections: sects });
testResume({ title: 'empty', duration: 0, sections: [], isValid: false });
