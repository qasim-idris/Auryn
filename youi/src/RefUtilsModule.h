#ifndef _REF_UTILS_MODULE_H_
#define _REF_UTILS_MODULE_H_

#include <youireact/NativeModule.h>
#include <youireact/IBridge.h>
#include <scenetree/YiSceneNode.h>

class YI_RN_MODULE(RefUtilsModule)
{
public:
    YI_RN_EXPORT_NAME(RefUtils);
    RefUtilsModule();
    YI_RN_EXPORT_METHOD(setPointerEvents)(uint64_t tag, bool mode);
    YI_RN_EXPORT_METHOD(setParentCompositionPointerEvents)(uint64_t tag, bool mode);    
private:
    CYISceneNode* GetShadowTreeCounterpart(yi::react::IBridge &bridge, uint64_t tag);
};


#endif
