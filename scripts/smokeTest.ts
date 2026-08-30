const baseUrl = (process.argv[2] || process.env.MIRRORTRACE_APP_URL || 'http://localhost:3000')
  .replace(/\/+$/, '');

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

const results: Check[] = [];

function record(name: string, ok: boolean, detail: string): void {
  results.push({ name, ok, detail });
}

async function checkHealth(): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await response.text();

    let payload: unknown = null;

    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }

    record(
      'GET /api/health',
      response.ok,
      `${response.status} ${response.statusText} ${JSON.stringify(payload)}`
    );
  } catch (error) {
    record(
      'GET /api/health',
      false,
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkHome(): Promise<void> {
  try {
    const response = await fetch(baseUrl, {
      redirect: 'manual',
    });

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    const looksLikeHtml =
      contentType.includes('text/html') &&
      body.includes('<div id="root"></div>');

    record(
      'Landing page',
      response.ok && looksLikeHtml,
      `${response.status} ${response.statusText}; content-type=${contentType}`
    );
  } catch (error) {
    record(
      'Landing page',
      false,
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkFavicon(): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/favicon.svg`);

    record(
      'Favicon',
      response.ok,
      `${response.status} ${response.statusText}`
    );
  } catch (error) {
    record(
      'Favicon',
      false,
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkAdminRequiresAuth(): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: {
        Accept: 'application/json',
      },
    });

    record(
      'Admin route denies anonymous access',
      response.status === 401 || response.status === 403,
      `${response.status} ${response.statusText}`
    );
  } catch (error) {
    record(
      'Admin route denies anonymous access',
      false,
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkUnknownApi(): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/api/__mirrortrace_missing_route__`);

    record(
      'Unknown API does not return app HTML',
      response.status === 404,
      `${response.status} ${response.statusText}`
    );
  } catch (error) {
    record(
      'Unknown API does not return app HTML',
      false,
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function main(): Promise<void> {
  console.log(`\nMirrorTrace smoke test: ${baseUrl}\n`);

  await checkHealth();
  await checkHome();
  await checkFavicon();
  await checkAdminRequiresAuth();
  await checkUnknownApi();

  let failed = 0;

  for (const result of results) {
    console.log(
      `[${result.ok ? 'PASS' : 'FAIL'}] ${result.name}: ${result.detail}`
    );

    if (!result.ok) {
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\nSmoke test failed: ${failed} check(s) failed.\n`);
    process.exitCode = 1;
    return;
  }

  console.log('\nSmoke test passed.\n');
}

void main();
