/**
 * Copyright (c) You i Labs Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

#include "AppFactory.h"
#include "App.h"

#define APP_NAME "Auryn"

#if defined(YI_PS4) || defined(YI_XBOX_360) || defined(YI_PS3)
#define APP_WIDTH (1920)
#define APP_HEIGHT (1080)
#else
#define APP_WIDTH (1920)
#define APP_HEIGHT (1080)
#endif

std::unique_ptr<CYIApp> AppFactory::Create()
{
    return std::make_unique<App>();
}

int AppFactory::GetWindowWidth()
{
    return APP_WIDTH;
}

int AppFactory::GetWindowHeight()
{
    return APP_HEIGHT;
}

const char * AppFactory::GetWindowName()
{
    return APP_NAME;
}
