// Test CORS headers locally (simulate Lambda Function URL behavior)

const createOrder = require("./backend/lambda/orders/createOrder");

// Test 1: OPTIONS request (CORS preflight)
async function testOptions() {
  console.log("\n🧪 Test 1: OPTIONS Request (CORS Preflight)");
  console.log("=".repeat(50));

  const event = {
    requestContext: {
      http: {
        method: "OPTIONS",
      },
    },
    headers: {
      Origin: "http://localhost:5173",
    },
  };

  const response = await createOrder.handler(event);

  console.log("Status Code:", response.statusCode);
  console.log("Headers:", JSON.stringify(response.headers, null, 2));

  // Verify CORS headers
  const hasOrigin = response.headers["Access-Control-Allow-Origin"] === "*";
  const hasMethods =
    response.headers["Access-Control-Allow-Methods"]?.includes("POST");
  const hasHeaders =
    response.headers["Access-Control-Allow-Headers"]?.includes("Authorization");

  console.log("\n✅ Checks:");
  console.log(`  - Allow-Origin: ${hasOrigin ? "✓" : "✗"}`);
  console.log(`  - Allow-Methods: ${hasMethods ? "✓" : "✗"}`);
  console.log(`  - Allow-Headers: ${hasHeaders ? "✓" : "✗"}`);

  return hasOrigin && hasMethods && hasHeaders;
}

// Test 2: POST request without auth (should fail but return CORS headers)
async function testPostWithoutAuth() {
  console.log("\n🧪 Test 2: POST Request without Authorization");
  console.log("=".repeat(50));

  const event = {
    requestContext: {
      http: {
        method: "POST",
      },
    },
    headers: {
      Origin: "http://localhost:5173",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ product_id: "test-123", quantity: 1 }],
      shippingAddress: { street: "123 Main St", city: "Boston" },
      paymentMethod: "card",
    }),
  };

  const response = await createOrder.handler(event);

  console.log("Status Code:", response.statusCode);
  console.log("Headers:", JSON.stringify(response.headers, null, 2));
  console.log("Body:", response.body);

  // Verify CORS headers are present even in error response
  const hasOrigin = response.headers["Access-Control-Allow-Origin"] === "*";
  const hasMethods =
    response.headers["Access-Control-Allow-Methods"]?.includes("POST");

  console.log("\n✅ Checks:");
  console.log(`  - Allow-Origin: ${hasOrigin ? "✓" : "✗"}`);
  console.log(`  - Allow-Methods: ${hasMethods ? "✓" : "✗"}`);
  console.log(`  - Returns 401: ${response.statusCode === 401 ? "✓" : "✗"}`);

  return hasOrigin && hasMethods;
}

// Run all tests
async function runTests() {
  console.log("\n🚀 CORS Fix Verification Tests");
  console.log("=".repeat(50));

  try {
    const test1 = await testOptions();
    const test2 = await testPostWithoutAuth();

    console.log("\n" + "=".repeat(50));
    console.log("📊 Test Results:");
    console.log(`  Test 1 (OPTIONS): ${test1 ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`  Test 2 (POST/Auth): ${test2 ? "✅ PASS" : "❌ FAIL"}`);

    if (test1 && test2) {
      console.log("\n✅ All tests passed! Ready to deploy.");
      console.log("\n📋 Next Steps:");
      console.log("  1. Run: .\\deploy-createOrder.ps1");
      console.log("  2. Test from frontend: http://localhost:5173/");
      console.log("  3. Check CloudWatch logs if issues persist");
    } else {
      console.log("\n❌ Some tests failed. Check the code and try again.");
    }
  } catch (error) {
    console.error("\n❌ Test error:", error.message);
    console.error(error);
  }
}

runTests();
