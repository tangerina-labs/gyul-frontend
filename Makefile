.PHONY: install dev build test test-unit test-e2e test-coverage clean

install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm run build

test:
	pnpm run test

test-unit:
	pnpm vitest run

test-unit-watch:
	pnpm vitest

test-e2e:
	pnpm exec playwright test --reporter=list

test-e2e-ui:
	pnpm exec playwright test --ui

test-coverage:
	pnpm vitest run --coverage

clean:
	rm -rf node_modules dist coverage playwright-report test-results
