#ifndef REPOSITORY_HPP_
#define REPOSITORY_HPP_

#include "log_manager.hpp"
#include "train_manager.hpp"

namespace GitGud
{

  enum Task
  {
    TASK_LOG,
    TASK_TRAIN
  };

  class Repository
  {
  private:
    Task m_task;  

    union
    {
      LogManager log_mgr;
      TrainManager train_mgr;
    } m_mgr;

  public:
    Repository(Task task);

    bool gitInstalled();
    bool isRepository();
    void initialiseTask();
    void executeTask();
  };

}

#endif