cmake_minimum_required(VERSION 3.10)
project(BattleSimulatorEngine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    src/BattleEngine.cpp
)

# Header files
set(HEADERS
    include/BattleEngine.h
)

# Include directories
include_directories(include)

# Check if building for WebAssembly
if(EMSCRIPTEN)
    # WebAssembly build
    add_executable(battle_sim 
        ${SOURCES} 
        ${HEADERS}
        src/wasm_bindings.cpp
    )
    
    set_target_properties(battle_sim PROPERTIES
        COMPILE_FLAGS "-O3 -s WASM=1"
        LINK_FLAGS "-O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='createBattleSimulator' -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] --bind -s ALLOW_MEMORY_GROWTH=1"
    )
    
    # Output to wasm-build directory
    set_target_properties(battle_sim PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/wasm-build"
    )
else()
    # Native build for testing
    add_executable(battle_sim_test 
        ${SOURCES} 
        ${HEADERS}
        tests/test_main.cpp
    )
    
    # Enable testing
    enable_testing()
    add_test(NAME BattleSimulatorTests COMMAND battle_sim_test)
endif()
