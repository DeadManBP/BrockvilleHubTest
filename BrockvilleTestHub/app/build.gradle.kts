plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    namespace="ca.brockvillehub.test"
    compileSdk=35
    buildFeatures {
        buildConfig=true
    }
    defaultConfig {
        applicationId="ca.brockvillehub.test"
        minSdk=23
        targetSdk=35
        versionCode=(project.findProperty("hubVersionCode")?.toString()?.toIntOrNull() ?: 3)
        versionName=(project.findProperty("hubVersionName")?.toString() ?: "0.2.0")
    }
    signingConfigs {
        create("hub") {
            val ksPath = System.getenv("HUB_KEYSTORE_FILE")
            if (!ksPath.isNullOrBlank()) {
                storeFile = file(ksPath)
                storeType = "PKCS12"
                storePassword = System.getenv("HUB_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("HUB_KEY_ALIAS") ?: "brockvillehub"
                keyPassword = System.getenv("HUB_KEY_PASSWORD") ?: System.getenv("HUB_KEYSTORE_PASSWORD")
            }
        }
    }
    buildTypes {
        debug {
            if (!System.getenv("HUB_KEYSTORE_FILE").isNullOrBlank()) {
                signingConfig = signingConfigs.getByName("hub")
            }
        }
        release {
            if (!System.getenv("HUB_KEYSTORE_FILE").isNullOrBlank()) {
                signingConfig = signingConfigs.getByName("hub")
            }
        }
    }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.10.0")
}
