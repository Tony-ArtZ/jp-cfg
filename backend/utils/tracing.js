import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || "http://jaeger:14268/api/traces",
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
    }),
  ],
  serviceName: "jp-cfg-backend",
});

export const initTracing = () => {
  try {
    sdk.start();
    console.log("OpenTelemetry tracing initialized successfully");
  } catch (error) {
    console.error("Error initializing OpenTelemetry:", error);
  }
};

export default sdk;
