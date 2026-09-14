plugins {
    alias(libs.plugins.android.application) apply false
}

val currentJavaHome = providers.systemProperty("java.home").get()
val jlinkExecutable = file(
    "$currentJavaHome/bin/jlink${if (System.getProperty("os.name").startsWith("Windows")) ".exe" else ""}"
)

check(jlinkExecutable.isFile) {
    """
    Este proyecto Android necesita ejecutarse con un JDK completo que incluya jlink.
    Gradle esta usando: $currentJavaHome

    Solucion:
    1. Instala JDK 21.
    2. Configura JAVA_HOME apuntando a la carpeta del JDK, por ejemplo:
       C:\Program Files\Java\jdk-21
    3. Cierra y vuelve a abrir VS Code/Android Studio para que Gradle tome el cambio.

    No uses el JRE embebido de VS Code/Red Hat Java para compilar Android.
    """.trimIndent()
}
