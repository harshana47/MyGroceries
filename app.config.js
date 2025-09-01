import 'dotenv/config';

export default {
  expo: {
    name: "task-manager-app",
    slug: "task-manager-app",
    version: "1.0.0",
    extra: {
      eas: {
        projectId: "714b7247-efac-491e-bfd9-c0d366cdebbd"
      },
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
    },
    android: {
      package: "com.harshana_47.taskmanagerapp",
    }
  }
};
