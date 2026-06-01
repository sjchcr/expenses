// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.2"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.pnpm/@capacitor+app@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/app"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/.pnpm/@capacitor+filesystem@8.1.0_@capacitor+core@8.0.2/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorKeyboard", path: "../../../node_modules/.pnpm/@capacitor+keyboard@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorPreferences", path: "../../../node_modules/.pnpm/@capacitor+preferences@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/preferences"),
        .package(name: "CapacitorShare", path: "../../../node_modules/.pnpm/@capacitor+share@8.0.0_@capacitor+core@8.0.2/node_modules/@capacitor/share"),
        .package(name: "CapgoCapacitorSocialLogin", path: "../../../node_modules/.pnpm/@capgo+capacitor-social-login@8.2.21_@capacitor+core@8.0.2/node_modules/@capgo/capacitor-social-login")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorPreferences", package: "CapacitorPreferences"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapgoCapacitorSocialLogin", package: "CapgoCapacitorSocialLogin")
            ]
        )
    ]
)
