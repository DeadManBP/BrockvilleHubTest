plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace="ca.brockvillehub.test"
    compileSdk=35
    defaultConfig {
        applicationId="ca.brockvillehub.test"
        minSdk=23
        targetSdk=35
        versionCode=1
        versionName="0.1.0"
    }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.10.0")
}
