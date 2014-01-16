_MOCHA=node_modules/.bin/_mocha
MOCHA_OPTS=
REPORTER = dot
NODE_ENV = test

check: test

test: test-server-api

test-server-api:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--bail \
		test/server/api/*.js
